BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Clientes" (
	"id_cliente"	INTEGER,
	"nombre"	TEXT NOT NULL,
	"apellido"	TEXT,
	"telefono"	TEXT,
	"direccion"	TEXT,
	"email"	TEXT,
	"fecha_registro"	TEXT NOT NULL,
	PRIMARY KEY("id_cliente" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "DetalleVenta" (
	"id_detalle_venta"	INTEGER,
	"id_venta"	INTEGER NOT NULL,
	"id_producto"	INTEGER NOT NULL,
	"cantidad"	INTEGER NOT NULL,
	"precio_unitario"	REAL NOT NULL,
	"subtotal"	REAL NOT NULL,
	PRIMARY KEY("id_detalle_venta" AUTOINCREMENT),
	FOREIGN KEY("id_producto") REFERENCES "Productos"("id_producto"),
	FOREIGN KEY("id_venta") REFERENCES "Ventas"("id_venta")
);
CREATE TABLE IF NOT EXISTS "Deudas" (
	"id_deuda"	INTEGER,
	"id_cliente"	INTEGER,
	"id_usuario"	INTEGER,
	"tipo_deuda"	TEXT NOT NULL,
	"monto_original"	REAL NOT NULL,
	"monto_pendiente"	REAL NOT NULL,
	"fecha_creacion"	TEXT NOT NULL,
	"fecha_vencimiento"	TEXT,
	"estado"	TEXT NOT NULL,
	"descripcion"	TEXT,
	PRIMARY KEY("id_deuda" AUTOINCREMENT),
	FOREIGN KEY("id_cliente") REFERENCES "Clientes"("id_cliente"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id_usuarios")
);
CREATE TABLE IF NOT EXISTS "Gastos" (
	"id_gasto"	INTEGER,
	"id_usuario"	INTEGER,
	"fecha_gasto"	TEXT NOT NULL,
	"monto"	REAL NOT NULL,
	"descripcion"	TEXT,
	"categoria"	TEXT,
	PRIMARY KEY("id_gasto" AUTOINCREMENT),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id_usuarios")
);
CREATE TABLE IF NOT EXISTS "PagosDeuda" (
	"id_pago"	INTEGER,
	"id_deuda"	INTEGER NOT NULL,
	"fecha_pago"	TEXT NOT NULL,
	"monto_pago"	REAL NOT NULL,
	"metodo_pago"	TEXT,
	PRIMARY KEY("id_pago" AUTOINCREMENT),
	FOREIGN KEY("id_deuda") REFERENCES "Deudas"("id_deuda")
);
CREATE TABLE IF NOT EXISTS "Productos" (
	"id_producto"	INTEGER,
	"nombre"	TEXT NOT NULL,
	"descripcion"	TEXT,
	"precio_venta"	REAL NOT NULL,
	"precio_costo"	REAL,
	"stock"	INTEGER NOT NULL,
	"unidad_medida"	TEXT,
	"fecha_creacion"	TEXT NOT NULL,
	"ultima_actualizacion"	TEXT NOT NULL,
	PRIMARY KEY("id_producto" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "Ventas" (
	"id_venta"	INTEGER,
	"id_cliente"	INTEGER,
	"id_usuario"	INTEGER,
	"fecha_venta"	TEXT NOT NULL,
	"total_venta"	REAL NOT NULL,
	"tipo_pago"	TEXT,
	"estado"	TEXT,
	PRIMARY KEY("id_venta" AUTOINCREMENT),
	FOREIGN KEY("id_cliente") REFERENCES "Clientes"("id_cliente"),
	FOREIGN KEY("id_usuario") REFERENCES "Usuarios"("id_usuarios")
);
CREATE TABLE IF NOT EXISTS "usuarios" (
	"id_usuarios"	INTEGER,
	"nombre_usuario"	TEXT NOT NULL UNIQUE,
	"contraseña"	TEXT NOT NULL,
	"rol"	TEXT NOT NULL,
	"fecha_creacion"	TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
	"ultima_sesion"	TEXT,
	PRIMARY KEY("id_usuarios" AUTOINCREMENT)
);
INSERT INTO "Clientes" VALUES (1,'Carlos','Perez','3001234567','Calle 1 #23-45','carlos@gmail.com','2025-08-01 09:00:00');
INSERT INTO "Clientes" VALUES (2,'Luisa','Martinez','3017654321','Carrera 45 #10-20','luisa@hotmail.com','2025-08-02 11:30:00');
INSERT INTO "Clientes" VALUES (3,'Carlos','Perez','3001234567','Calle 1 #23-45','carlos@gmail.com','2025-08-01 09:00:00');
INSERT INTO "Clientes" VALUES (4,'Luisa','Martinez','3017654321','Carrera 45 #10-20','luisa@hotmail.com','2025-08-02 11:30:00');
INSERT INTO "Clientes" VALUES (5,'Carlos','Perez','3001234567','Calle 1 #23-45','carlos@gmail.com','2025-08-01 09:00:00');
INSERT INTO "Clientes" VALUES (6,'Luisa','Martinez','3017654321','Carrera 45 #10-20','luisa@hotmail.com','2025-08-02 11:30:00');
INSERT INTO "Clientes" VALUES (7,'Carlos','Perez','3001234567','Calle 1 #23-45','carlos@gmail.com','2025-08-01 09:00:00');
INSERT INTO "DetalleVenta" VALUES (1,1,1,2,35000.0,70000.0);
INSERT INTO "DetalleVenta" VALUES (2,1,2,1,85000.0,85000.0);
INSERT INTO "Deudas" VALUES (1,2,1,'Cliente',100000.0,50000.0,'2025-08-01 12:00:00','2025-09-01 12:00:00','Pendiente','Pago a crédito');
INSERT INTO "Gastos" VALUES (1,1,'2025-08-02 08:00:00',15000.0,'Compra de sobres','Papeleria');
INSERT INTO "Gastos" VALUES (2,1,'2025-08-04 10:15:00',80000.0,'Pago servicios','Servicios');
INSERT INTO "PagosDeuda" VALUES (1,1,'2025-08-05 09:00:00',50000.0,'Efectivo');
INSERT INTO "Productos" VALUES (1,'Camiseta','Camiseta de algodon',35000.0,20000.0,100,'unidad','2025-08-01 10:00:00','2025-08-01 10:00:00');
INSERT INTO "Productos" VALUES (2,'Pantalon','Pantalon jeans azul',85000.0,50000.0,50,'unidad','2025-08-01 10:30:00','2025-08-01 10:30:00');
INSERT INTO "Productos" VALUES (3,'Camiseta','Camiseta de algodon',35000.0,20000.0,100,'unidad','2025-08-01 10:00:00','2025-08-01 10:00:00');
INSERT INTO "Productos" VALUES (4,'Pantalon','Pantalon jeans azul',85000.0,50000.0,50,'unidad','2025-08-01 10:30:00','2025-08-01 10:30:00');
INSERT INTO "Productos" VALUES (5,'Camiseta','Camiseta de algodon',35000.0,20000.0,100,'unidad','2025-08-01 10:00:00','2025-08-01 10:00:00');
INSERT INTO "Productos" VALUES (6,'Pantalon','Pantalon jeans azul',85000.0,50000.0,50,'unidad','2025-08-01 10:30:00','2025-08-01 10:30:00');
INSERT INTO "Productos" VALUES (7,'Camiseta','Camiseta de algodon',35000.0,20000.0,100,'unidad','2025-08-01 10:00:00','2025-08-01 10:00:00');
INSERT INTO "Productos" VALUES (8,'Pantalon','Pantalon jeans azul',85000.0,50000.0,50,'unidad','2025-08-01 10:30:00','2025-08-01 10:30:00');
INSERT INTO "Ventas" VALUES (1,1,1,'2025-08-03 14:00:00',155000.0,'Efectivo','Completada');
INSERT INTO "usuarios" VALUES (1,'admin','hash123','Administrador','2025-08-01 08:00:00',NULL);
COMMIT;
