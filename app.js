let countriesData = null;
let cameraAnchor  = null;
let selectedCountryMesh = null;
let cameraAnimState = null;
let sunLight, sunMesh, sunPivot; 

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

let scene, camera, renderer, controls, earth, clouds;

window.onload = init;
function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 3.5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x334466, 2.2));

    sunLight = new THREE.DirectionalLight(0xfff0cc, 1.4);
    sunLight.position.set(8, 2, 6);
    scene.add(sunLight);

    sunPivot = new THREE.Object3D();
    scene.add(sunPivot);

    const sunGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe87a });
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(8, 2, 6); 
    const glowGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const glowMat = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xffe060) } },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `
            uniform vec3 color;
            varying vec3 vNormal;
            void main() {
                float i = pow(0.72 - dot(vNormal, vec3(0.0,0.0,1.0)), 2.2);
                gl_FragColor = vec4(color, 1.0) * i;
            }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    sunMesh.add(glowMesh);
    const coronaGeo = new THREE.SphereGeometry(0.62, 32, 32);
    const coronaMat = new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0xff9900) } },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
        fragmentShader: `
            uniform vec3 color;
            varying vec3 vNormal;
            void main() {
                float i = pow(0.65 - dot(vNormal, vec3(0.0,0.0,1.0)), 3.0);
                gl_FragColor = vec4(color, 0.35) * i;
            }`,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    sunMesh.add(new THREE.Mesh(coronaGeo, coronaMat));

    sunPivot.add(sunMesh);
    const loader = new THREE.TextureLoader();
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);

    const earthMat = new THREE.MeshPhongMaterial({
        map:        loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
        specularMap:loader.load('https://unpkg.com/three-globe/example/img/earth-water.png'),
        specular:   new THREE.Color(0x4499bb),
        shininess:  35,
    });

    earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);
    const cloudGeo  = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudMat  = new THREE.MeshPhongMaterial({
        map: loader.load('https://unpkg.com/three-globe/example/img/earth-clouds.png'),
        transparent: true,
        opacity: 0.35,
        depthWrite: false
    });
    clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    const atmoGeo = new THREE.SphereGeometry(1.09, 64, 64);
    const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float i = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
                gl_FragColor = vec4(0.18, 0.50, 1.0, 1.0) * i;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));
    createStarField();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.05;
    controls.rotateSpeed    = 0.45;
    controls.minDistance    = 1.5;
    controls.maxDistance    = 7;
    controls.enablePan      = false;

    controls.addEventListener('start', () => {
        if (cameraAnchor) {
            earth.remove(cameraAnchor);
            cameraAnchor = null;
        }
        cameraAnimState = null;
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click',  onCountryClick);

    animate();
    fadeOutLoader();
}

function createStarField() {
    const geo = new THREE.BufferGeometry();
    const verts = [];
    for (let i = 0; i < 8000; i++) {
        verts.push(
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000,
            (Math.random() - 0.5) * 2000
        );
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.4,
        sizeAttenuation: false
    })));
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    earth.rotation.y  += 0.0008;
    clouds.rotation.y += 0.001;
    sunPivot.rotation.y += 0.0004;
    sunPivot.rotation.x  = 0.22; 
    const sunWorldPos = new THREE.Vector3();
    sunMesh.getWorldPosition(sunWorldPos);
    sunLight.position.copy(sunWorldPos);

    if (cameraAnimState) {
    
        const t    = Math.min((performance.now() - cameraAnimState.startTime) / cameraAnimState.duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        camera.position.lerpVectors(cameraAnimState.startPos, cameraAnimState.targetPos, ease);
        camera.lookAt(0, 0, 0);
        if (t >= 1) cameraAnimState = null;
    } else if (cameraAnchor) {
        const wp = new THREE.Vector3();
        cameraAnchor.getWorldPosition(wp);
        camera.position.lerp(wp, 0.03);
        camera.lookAt(0, 0, 0);
    }

    controls.update();
    renderer.render(scene, camera);
}
function fadeOutLoader() {
    const el = document.getElementById('loading-screen');
    if (!el) return;
    const bar = document.getElementById('loading-progress');
    if (bar) bar.style.width = '100%';
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 700);
    }, 1400);
}

fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
    .then(r => r.json())
    .then(data => {
        countriesData = data;
        console.log('✅ GeoJSON loaded —', data.features.length, 'countries');
    });
function onCountryClick(event) {
    if (event.target !== renderer.domElement) return;

    mouse.x =  (event.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(earth);
    if (!hits.length) return;
    const local = earth.worldToLocal(hits[0].point.clone());
    const lat   = Math.asin(local.y) * (180 / Math.PI);
    const lon   = -Math.atan2(local.z, local.x) * (180 / Math.PI);

    findCountryAt(lat, lon);
}

function findCountryAt(lat, lon) {
    if (!countriesData) return;
    const country = countriesData.features.find(f => isPointInCountry(lon, lat, f));
    if (country) {
        drawCountryOutline(country);
        displayCountryInfo(country.properties.NAME);
    }
}

function isPointInCountry(lon, lat, feature) {
    const pip = (poly, pt) => {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i];
            const [xj, yj] = poly[j];
            if (((yi > pt[1]) !== (yj > pt[1])) &&
                pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    };
    const { type, coordinates } = feature.geometry;
    if (type === 'Polygon')      return pip(coordinates[0], [lon, lat]);
    if (type === 'MultiPolygon') return coordinates.some(p => pip(p[0], [lon, lat]));
    return false;
}
function drawCountryOutline(feature) {
    if (selectedCountryMesh) {
        earth.remove(selectedCountryMesh);
        selectedCountryMesh = null;
    }

    const mat   = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
    const group = new THREE.Group();

    const polys = feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    polys.forEach(poly => {
        const pts = poly[0].map(c => {
            const φ = c[1] * (Math.PI / 180);
            const λ = (c[0] + 90) * (Math.PI / 180);
            const r = 1.016;
            return new THREE.Vector3(
                r * Math.cos(φ) * Math.sin(λ),
                r * Math.sin(φ),
                r * Math.cos(φ) * Math.cos(λ)
            );
        });
        group.add(new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(pts), mat
        ));
    });

    selectedCountryMesh = group;
    earth.add(selectedCountryMesh);
}

async function displayCountryInfo(name) {
    const panel = document.getElementById('info-panel');
    panel.classList.add('loading');
    panel.classList.add('visible');

    try {
        const res  = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
        const data = await res.json();
        const c    = data[0];

        document.getElementById('country-name').innerText       = c.name.common;
        document.getElementById('country-capital').innerText    = c.capital?.[0]          ?? 'N/A';
        document.getElementById('country-population').innerText = c.population.toLocaleString();
        document.getElementById('country-currency').innerText   = Object.values(c.currencies ?? {})[0]?.name ?? 'N/A';
        document.getElementById('country-region').innerText     = c.subregion ?? c.region  ?? 'N/A';


        const flag = document.getElementById('country-flag');
        flag.src            = c.flags.png;
        flag.style.display  = 'block';

        panel.classList.remove('loading');
    } catch (err) {
        console.error('REST Countries API error:', err);
        document.getElementById('country-name').innerText = name;
        panel.classList.remove('loading');
    }
}
document.getElementById('close-btn').onclick = function () {
    document.getElementById('info-panel').classList.remove('visible');

    if (selectedCountryMesh) {
        earth.remove(selectedCountryMesh);
        selectedCountryMesh = null;
    }
    if (cameraAnchor) {
        earth.remove(cameraAnchor);
        cameraAnchor = null;
    }
    cameraAnimState = null;

    controls.target.set(0, 0, 0);
    controls.update();
};
document.getElementById('search-btn').addEventListener('click', searchCountry);

document.getElementById('country-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchCountry();
});

document.getElementById('country-search').addEventListener('input', function () {
    const val  = this.value.toLowerCase().trim();
    const list = document.getElementById('search-suggestions');

    if (!val || val.length < 2 || !countriesData) {
        list.innerHTML = '';
        list.style.display = 'none';
        return;
    }

    const matches = countriesData.features
        .filter(f => f.properties.NAME.toLowerCase().includes(val))
        .slice(0, 7);

    if (!matches.length) { list.style.display = 'none'; return; }

    list.innerHTML = matches.map(f => {
        const n = f.properties.NAME.replace(/'/g, "\\'");
        return `<div class="suggestion-item" onclick="selectSuggestion('${n}')">${f.properties.NAME}</div>`;
    }).join('');
    list.style.display = 'block';
});

function selectSuggestion(name) {
    document.getElementById('country-search').value = name;
    const list = document.getElementById('search-suggestions');
    list.innerHTML = '';
    list.style.display = 'none';
    runSearch(name);
}

function searchCountry() {
    const val = document.getElementById('country-search').value.trim();
    document.getElementById('search-suggestions').style.display = 'none';
    if (val) runSearch(val);
}

function runSearch(input) {
    if (!countriesData) return;
    const lower = input.toLowerCase();
    const country =
        countriesData.features.find(f => f.properties.NAME.toLowerCase() === lower) ||
        countriesData.features.find(f => f.properties.NAME.toLowerCase().includes(lower));

    if (country) {
        drawCountryOutline(country);
        displayCountryInfo(country.properties.NAME);
        focusOnCountry(country);
    }
}

function focusOnCountry(feature) {
    const ring = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];
    let sumLon = 0, sumLat = 0;
    ring.forEach(c => { sumLon += c[0]; sumLat += c[1]; });
    const lon = sumLon / ring.length;
    const lat = sumLat / ring.length;

    const dist = 2.75;
    const phi   = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const tx = -dist * Math.sin(phi) * Math.cos(theta);
    const ty =  dist * Math.cos(phi);
    const tz =  dist * Math.sin(phi) * Math.sin(theta);
    if (cameraAnchor) earth.remove(cameraAnchor);
    cameraAnchor = new THREE.Object3D();
    cameraAnchor.position.set(tx, ty, tz);
    earth.add(cameraAnchor);
    cameraAnimState = {
        startPos:  camera.position.clone(),
        targetPos: new THREE.Vector3(tx, ty, tz),
        startTime: performance.now(),
        duration:  1800
    };
}
