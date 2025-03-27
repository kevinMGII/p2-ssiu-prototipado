# p2-ssiu-prototipado
Fase 2: Sistemas Interactivos y Ubicuos. 

Prototipado e implementación del asistente de reuniones.

 -------------------------------------------------------

 Para lanzar el servidor a múltiples dispositivos:
   0. npm init -y                     # Inicializar un proyecto Node.js 
   1. npm install express socket.io   # Instalar dependencias necesarias
   2. ipconfig                        # Windows  
      ifconfig | grep inet            # Linux/Mac
      ip addr show
      
                                    # El firewall debe permitir conexiones en el puerto 3000
      
   4. node server.mjs
   5. http://localhost:3000    # En un navegador
   6. http://IP_LOCAL:3000     # Desde otro dispositivo en la misma red, acceder al servidor usando la IP obtenida

