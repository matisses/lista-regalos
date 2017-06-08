/*
 * Si el usuario se encuentra dentro de la red matisses y el servidor wildfly es una maquina diferente a la del servidor web, 
 * es necesario configurar una regla de iptables dentro del servidor web que redirija el trafico del puerto 8080 a la ip privada
 * del servidor wildfly.
 * Ejemplo: redirigir todo el trafico que llegue al puerto 8080 al mismo puerto de la ip 192.168.5.19
 * 
 *   iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.5.19:8080
 * 
 *  Luego de ejecutar el comando, es necesario tambien ejecutar el siguiente comando para enmascarar el cambio y hacerlo invisible para el usuario
 *
 *   iptables -t nat -A POSTROUTING -j MASQUERADE
 */
appParameters = {
    urlSite: 'http://192.168.5.19/',
    urlRest: 'http://192.168.5.19:8080/360/webresources/'
};