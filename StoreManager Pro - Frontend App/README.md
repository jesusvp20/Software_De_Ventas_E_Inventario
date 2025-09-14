Este proyecto es una aplicación desarrollada con **Ionic + Angular**, utilizando **Firebase Authentication** y **Cloud Firestore** para la gestion de ventas e inventario
Actualmente cuenta con las funcionalidades de **registro e inicio de sesión**, restringiendo el acceso únicamente a usuarios con rol de **administrador**.

## 🚀 Tecnologías utilizadas
- [Ionic Framework](https://ionicframework.com/)  
- [Angular](https://angular.io/)  
- [Firebase Authentication](https://firebase.google.com/products/auth)  
- [Cloud Firestore](https://firebase.google.com/products/firestore)

## ⚙️ Funcionalidades actuales

- Registro de usuario con **Firebase Auth**  
- Inicio de sesión con validación de credenciales  
- Guardado de información del usuario en **Firestore** (uid, email, nombre, rol)  
- Asignación de rol por defecto: `admin`  
- Verificación de rol al iniciar sesión → solo los administradores pueden acceder  

---

## 📂 Estructura básica
src/
├── app/
│ ├── aut.service.ts # Servicio para Auth y Firestore
│ ├── login/ # Página de inicio de sesión
│ └── register/ # Página de registro
└── environments/ # Configuración de Firebase

## 🔑 Configuración del proyecto

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/tuusuario/inventario-ventas.git
   cd inventario-ventas
   Instalar dependencias:

npm install

Ejecutar la app en desarrollo:

ionic serve
