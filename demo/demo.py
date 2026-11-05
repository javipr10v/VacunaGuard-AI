import json, os, subprocess, time, urllib.request, urllib.error, uuid

RAIZ = os.path.expanduser("~/vacunaguard")


def leer_env(ruta):
    datos = {}
    for linea in open(ruta):
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            datos[k] = v
    return datos


raiz = leer_env(f"{RAIZ}/.env")
ident = leer_env(f"{RAIZ}/services/identity-service/.env")

ID = "http://127.0.0.1:3001/auth/login"
CC = "http://127.0.0.1:3002"
RG = "http://127.0.0.1:3003"
RT = "http://127.0.0.1:3004"


def llamar(metodo, url, cuerpo=None, token=None):
    cab = {"Content-Type": "application/json"}
    if token:
        cab["Authorization"] = "Bearer " + token
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(url, data=datos, headers=cab, method=metodo)
    try:
        r = urllib.request.urlopen(req)
        return r.status, json.load(r)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read().decode())
        except Exception:
            return e.code, {}


def consulta(contenedor, base, sql):
    return subprocess.run(
        ["docker", "exec", contenedor, "psql", "-U", raiz["DB_USER"], "-d", base, "-Atc", sql],
        capture_output=True, text=True,
    ).stdout.strip()


def paso(n, titulo):
    print(f"\n=== PASO {n}: {titulo} ===")
    input("   [Enter para ejecutar] ")


def ok(texto, bueno=True):
    print(("   OK    " if bueno else "   FALLA ") + texto)


paso(1, "Cadena de frío: una lectura de 11 °C (rango seguro 2 a 8 °C)")
s, r = llamar("POST", CC + "/lecturas", {"sensorId": "sensor-demo", "hielera": "H-01", "temperatura": 11})
ok(f"estado {r.get('estado')}, alerta publicada: {r.get('alertaPublicada')}", s == 201)
print("   -> Revisa Telegram: debe llegar la alerta (RabbitMQ -> n8n -> Telegram)")

paso(2, "Seguridad: sin token no se entra, y un brigadista no puede crear lotes")
sufijo = uuid.uuid4().hex[:5]
vacuna = "Demo-" + sufijo
lote = {"vacuna": vacuna, "numeroLote": "L-DEMO", "cantidad": 22,
        "fechaCaducidad": "2999-01-01", "umbralStockBajo": 20}
s, _ = llamar("POST", CC + "/lotes", lote)
ok(f"crear lote sin token: {s} (esperado 401)", s == 401)
s, r = llamar("POST", ID, {"email": "ana@correo.com", "password": "Segura2026"})
ana = r.get("accessToken")
ok(f"login de la brigadista Ana: {s}", s == 200)
s, _ = llamar("POST", CC + "/lotes", lote, ana)
ok(f"crear lote como brigadista: {s} (esperado 403)", s == 403)

paso(3, "El administrador da de alta un lote de 22 dosis (umbral de stock bajo: 20)")
s, r = llamar("POST", ID, {"email": ident["ADMIN_EMAIL"], "password": ident["ADMIN_PASSWORD"]})
adm = r.get("accessToken")
s, r = llamar("POST", CC + "/lotes", lote, adm)
ok(f"lote {vacuna} creado: {s}", s == 201)

paso(4, "El brigadista registra a un ciudadano (la CURP se guarda cifrada)")
ciud = {"curp": "GUMJ900515HCSZRV08", "nombre": "Luis Gómez", "fechaNacimiento": "2020-06-15"}
s, r = llamar("POST", RG + "/ciudadanos", ciud, ana)
ok(f"ciudadano registrado: {s}, CURP devuelta: {r.get('curp')}", s == 201)
cid = r.get("id")
print("   En la base:", consulta("vg-registry-db", "registry_db",
      "select left(curp_cifrada,18) || '...' from ciudadanos limit 1"))

paso(5, "Se aplican 3 vacunas: Registry publica vacuna.aplicada y Cold Chain descuenta stock")
for dosis in (1, 2, 3):
    s, r = llamar("POST", RG + "/vacunaciones",
                  {"ciudadanoId": cid, "vacuna": vacuna, "lote": "L-DEMO", "numeroDosis": dosis}, ana)
    time.sleep(2)
    stock = consulta("vg-coldchain-db", "coldchain_db",
                     f"select cantidad from lotes where vacuna='{vacuna}' and numero_lote='L-DEMO'")
    ok(f"dosis {dosis} registrada ({s}); stock actual del lote: {stock}", s == 201)

paso(6, "Al cruzar el umbral, Cold Chain publica stock.bajo y Routes lo guarda")
time.sleep(1)
print("   Alertas en Routes:", consulta("vg-routes-db", "routes_db",
      f"select vacuna || ' | stock ' || stock_restante || ' | umbral ' || umbral from alertas_stock where vacuna='{vacuna}'"))

paso(7, "Routes: ruta de una brigada por Chiapas (PostGIS), pedida en desorden")
puntos = [("Parque Marimba", 16.7531, -93.1156, 40), ("ZOOMAT", 16.7219, -93.1008, 25),
          ("Chiapa de Corzo", 16.7064, -93.0112, 30), ("San Cristobal", 16.7370, -92.6376, 60)]
ids = []
for nombre, lat, lon, pers in puntos:
    s, r = llamar("POST", RT + "/puntos",
                  {"nombre": f"{nombre} {sufijo}", "latitud": lat, "longitud": lon,
                   "personasEstimadas": pers}, adm)
    ids.append(r.get("id"))
desorden = [ids[3], ids[1], ids[0], ids[2]]
s, r = llamar("POST", RT + "/rutas", {"brigadaId": "brigada-demo", "origenLatitud": 16.7528,
                                       "origenLongitud": -93.1152, "puntoIds": desorden}, adm)
ok(f"ruta planificada: {s}", s == 201)
for p in r.get("paradas", []):
    print(f"      {p['orden']}. {p['nombre']}")
print(f"   Distancia total: {r.get('distanciaTotalKm')} km | Personas estimadas: {r.get('personasEstimadas')}")

print("\n=== FIN DE LA DEMO ===")
