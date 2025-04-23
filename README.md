# Miembros del grupo

Antonio de Mariano Pérez - 100495740@alumnos.uc3m.es
Alejandro Castro Orrillo - 100495795@alumnos.uc3m.es
Kevin Medina García - 100495893@alumnos.uc3m.es

# Instrucciones

 Para lanzar el servidor a múltiples dispositivos:
 
   0. npm init -y                     # Inicializar un proyecto Node.js 
   1. npm install express socket.io   # Instalar dependencias necesarias
   2. ipconfig                        # Windows  
      ifconfig | grep inet            # Linux/Mac
      ip addr show
      
   `# El firewall debe permitir conexiones en el puerto 3000`
      
   3. node server.mjs > server_log.log 2> server_err.log
   4. https://localhost:3000    # En un navegador
   5. https://IP_LOCAL:3000     # Desde otro dispositivo en la misma red, acceder al servidor usando la IP obtenida


Certificados realizados con: openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

