function fillTable(location) {
    if (CORS && mountpoints) {
        var table = document.getElementById("lista");
        table.innerHTML = "";
        var loc = location;

        if (!estados) {
            estados = parseStatus(mountpoints, CORS.cors);
        }

        if (!footer) {
            var foo = document.getElementsByClassName('page-footer');
            foo[0].style.display = "inline-block";
            footer = true;
        }

        document.getElementById("lat").innerHTML = loc.coords.latitude;
        document.getElementById("lon").innerHTML = loc.coords.longitude;
        document.getElementById("accu").innerHTML = (loc.coords.accuracy) ? `${loc.coords.accuracy.toFixed(3)}m` : " - ";

        c_obj = [];
        for (var i = 0; i < CORS.cors.length; i++) {
            var dist = calcDist(CORS.cors[i].lat, CORS.cors[i].lon, loc.coords.latitude, loc.coords.longitude);
            var cdist = (dist % 1 > 0) ? (dist-dist%1)+1 : dist;
            var t1 = ((cdist*3)+30);
            var t2 = ((cdist*2)+20);
            var edata = getJObjByCode(CORS.cors[i].codigo, estados);

            c_obj.push({
                cod : CORS.cors[i].codigo,
                lug : CORS.cors[i].lugar,
                dist : dist,
                prov : CORS.cors[i].proveedor,
                tie1 : t1,
                tie2 : t2,
                est : edata.est,
                mod : edata.mod,
            });
        }

        c_obj.sort((a, b) => a.dist - b.dist);

        for (var i = 0; i < c_obj.length; i++) {
            var cv1 = document.createElement("div");
            var cv2 = document.createElement("div");
            var cv3 = document.createElement("div");
            var cv4 = document.createElement("div");

            var est_d = document.createElement("div");
            var est_l = document.createElement("p");

            var p1 = document.createElement("p");
            var p2 = document.createElement("p");
            var p3 = document.createElement("p");

            var cod_el = document.createElement("span");
            var lug_el = document.createElement("span");
            var dist_el = document.createElement("span");

            var prov_el = document.createElement("span");
            var mod_el = document.createElement("span");

            var t1_el = document.createElement("span");
            var t2_el = document.createElement("span");

            cv1.className = "col s12 m7";
            cv2.className = "card horizontal";
            cv3.className = "card-stacked";
            cv4.className = "card-content";
            est_d.className = "card-action";

            var estado;
            var cname;
            if (c_obj[i].est) {
                cname = "online";
                estado = "EN LINEA";
            } else {
                cname = "offline";
                estado = "FUERA DE LINEA";
            }

            est_l.className = cname;
            est_l.innerHTML = estado.bold();

            cv4.style.padding = 10;

            lug_el.className = "lug";
            dist_el.className = "dist";
            mod_el.className = "mod";
            t2_el.className = "t2";

            cod_el.innerHTML = c_obj[i].cod.bold();
            lug_el.innerHTML = c_obj[i].lug;
            dist_el.innerHTML = `${c_obj[i].dist}km`;

            prov_el.innerHTML = c_obj[i].prov;
            mod_el.innerHTML = c_obj[i].mod;

            t1 = c_obj[i].tie1;
            t2 = c_obj[i].tie2;

            t1_el.innerHTML = `Tiempo(L1): ${pad(parseInt(t1/60), 2)}:${pad(parseInt(t1%60), 2)}`;
            t2_el.innerHTML = `Tiempo(L1/L2): ${pad(parseInt(t2/60), 2)}:${pad(parseInt(t2%60), 2)}`;

            p1.appendChild(cod_el);
            p1.appendChild(lug_el);
            p1.appendChild(dist_el);

            p2.appendChild(prov_el);
            p2.appendChild(mod_el);

            p3.appendChild(t1_el);
            p3.appendChild(t2_el);

            cv4.appendChild(p1);
            cv4.appendChild(p2);
            cv4.appendChild(p3);

            est_d.appendChild(est_l);

            cv3.appendChild(cv4);
            cv3.appendChild(est_d);

            cv2.appendChild(cv3);
            cv1.appendChild(cv2);

            table.appendChild(cv1);
        }
    }
}

function getJObjByCode(code, jarray) {
    var resObj;

    for (var i = 0; i < jarray.length; i++) {
        if (code == jarray[i].codigo) {
            resObj = jarray[i];
        }
    }

    return resObj;
}

function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function calcDist(lat1, lon1, lat2, lon2) {
    var geod = GeographicLib.Geodesic.WGS84, r;
    r = geod.Inverse(lat1, lon1, lat2, lon2);

    return (r.s12/1000).toFixed(2);
}

function parseStatus(response, clist) {
    var res = [];
    var el = document.createElement('html');
    el.innerHTML = response;

    var lineas = el.querySelectorAll('pre')[0].firstChild.data.split('\n');

    for (var i = 0; i < clist.length; i++) {
        var estado;
        var modo;
        for (var j = 0; j < lineas.length; j++) {
            var spl = lineas[j].split(';');
            if (spl[0] == "STR") {
                if (spl[1] == clist[i].codigo) {
                    estado = 1;
                    modo = spl[6];
                    break;
                } else {
                    estado = 0;
                    modo = " - ";
                }
            }
        }
        res.push({
            codigo : clist[i].codigo,
            est : estado,
            mod : modo
        });
    }

    return res;
}

function onDialogClose() {
    var lat = parseFloat(document.getElementById("lat_inp").value);
    var lon = parseFloat(document.getElementById("lon_inp").value);

    if (lat && lon) {
        navigator.geolocation.clearWatch(id);
        var moc_loc = {coords: {latitude: lat, longitude: lon}};

        fillTable(moc_loc);
        document.getElementById("ub_btn").style.visibility = "visible";
    }
}

function actvPosicion() {
    id = navigator.geolocation.watchPosition(fillTable, error, pos_options);
    var loc_b = document.getElementById("ub_btn");

    if (loc_b) {
        loc_b.style.visibility = "hidden";
        document.getElementById("lat").innerHTML = "Obteniendo posicion...";
        document.getElementById("lon").innerHTML = "Obteniendo posicion...";
    }
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
}

pos_options = {
  enableHighAccuracy: true,
  timeout: Infinity,
  maximumAge: 8000
};

var id;
window.onload = () => { id = navigator.geolocation.watchPosition(fillTable, error, pos_options); }
window.onfocus = () => { id = navigator.geolocation.watchPosition(fillTable, error, pos_options); }
window.onblur = () => { navigator.geolocation.clearWatch(id); }

var CORS;
fetch('cors.json').then(resp => resp.text()).then(data => {
    CORS = JSON.parse(data);
})

var footer;
var mountpoints;
var estados;
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const url = "http://redfc.ddns.net:2103/";
fetch(proxyurl + url)
.then(response => response.text())
.then(contents => mountpoints = contents)
.catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.modal');
    var instances = M.Modal.init(elems, null);
});
