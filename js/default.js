 var windowWidth = window.innerWidth,
     windowHeight = window.innerHeight;
 var camera, renderer, scene;
var meshArray = [];
// add your global variables here:
var helloWorldMesh;
var world, worldClouds, t, c, l;
var mesh1, mesh2, mesh3;
//var sizeM = 14;
var sizeM = 40;
var sizeMesh1=sizeM, sizeMesh2=sizeM, sizeMesh3=sizeM;
var depthCompress = 0.5;
var z0 = -5;
var radius = 25;
var textradius = 1.1*radius;

 head.ready(function() {
     Init();
     animate();
 });

 function Init() {
     scene = new THREE.Scene();

     //setup camera
     camera = new LeiaCamera({
         cameraPosition: new THREE.Vector3(_camPosition.x, _camPosition.y, _camPosition.z),
         targetPosition: new THREE.Vector3(_tarPosition.x, _tarPosition.y, _tarPosition.z)
     });
     scene.add(camera);

     //setup rendering parameter
     renderer = new LeiaWebGLRenderer({
         antialias: true,
         renderMode: _renderMode,
         shaderMode: _nShaderMode,
         colorMode: _colorMode,
         compFac:_depthCompressionFactor,
         devicePixelRatio: 1
     });
     renderer.Leia_setSize({
         width: windowWidth,
         height: windowHeight,
         autoFit: true
     });
     renderer.shadowMapEnabled = true;
     renderer.shadowMapSoft = true;
     document.body.appendChild(renderer.domElement);

     //add object to Scene
     addObjectsToScene();

     //add Light
     addLights();

     //add Gyro Monitor
     //addGyroMonitor();
 }

 function animate() {
     requestAnimationFrame(animate);
     
     //set mesh animation
    var time = LEIA.time;
    var dangle = 0.5;
     for (var i = 0; i < meshArray.length; i++) {
         var curMeshGroup = meshArray[i].meshGroup;
         switch (meshArray[i].name) {
           case "AUO2":
              curMeshGroup.position.set(textradius*Math.cos(time+dangle), 0, depthCompress*textradius*Math.sin(time+dangle)+z0);
             curMeshGroup.rotation.y = -time-dangle+Math.PI/2;
             break;
              default:
                 break;
         }
     }
   
     renderer.Leia_render({
         scene: scene,
         camera: camera,
         holoScreenSize: _holoScreenSize,
         holoCamFov: _camFov,
         upclip: _up,
         downclip: _down,
         filterA: _filterA,
         filterB: _filterB,
         filterC: _filterC,
         messageFlag: _messageFlag
     });
 }

 function addObjectsToScene() {
     //Add your objects here
      //add STL Object
     addSTLModel({
         path: 'resource/AUO2.stl',
         meshGroupName: 'AUO2',
         meshSizeX: sizeMesh1,
         meshSizeY: sizeMesh1,
         meshSizeZ: 0.4*sizeMesh1,
         translateX: 0,
         translateY: 0,
         translateZ: 0,
         color:0xff0000
     });
   

    // world sphere
    var worldTexture = new THREE.ImageUtils.loadTexture('resource/world_texture.jpg');
    worldTexture.wrapS = worldTexture.wrapT = THREE.RepeatWrapping;
    worldTexture.repeat.set(1, 1);
    var worldMaterial = new THREE.MeshPhongMaterial({
        map: worldTexture,
        bumpMap   : THREE.ImageUtils.loadTexture('resource/world_elevation.jpg'),
        bumpScale : 1.00,
        specularMap: THREE.ImageUtils.loadTexture('resource/world_water.png'),
        specular: new THREE.Color('grey'),
        color: 0xffdd99
    });
    var worldGeometry = new THREE.SphereGeometry(radius, 30, 30);
    world = new THREE.Mesh(worldGeometry, worldMaterial);
    world.position.z = z0;
    world.castShadow = true;
    world.receiveShadow = true;
    scene.add(world);
  
    world.matrixWorld.elements[10] = 0.1;
    world.matrixWorldNeedsUpdate = true;
 
    for (var q = 1; q<worldGeometry.vertices.length; q++) {
        worldGeometry.vertices[q].z *= depthCompress;
    }

   //add background texture
   //LEIA_setBackgroundPlane('resource/brickwall_900x600_small.jpg');
 }

function addTextMenu(parameters){
    parameters = parameters || {};
   
   var strText = parameters.text;
   var posX = parameters.positionX;
   var posY = parameters.positionY;
   var posZ = parameters.positionZ;
   var rotateX = parameters.rotateX;
   var rotateY = parameters.rotateY;
   var rotateZ = parameters.rotateZ;
   var name = parameters.name;
   var size = parameters.size;
   if(posX === undefined || posY === undefined || posZ === undefined){
     posX = 0;
     posY = 0;
     posZ = 0;
   }
   if(rotateX === undefined || rotateY === undefined || rotateZ === undefined){
     rotateX = 0;
     rotateY = 0;
     rotateZ = 0;
   }
   var menuGeometry = new THREE.TextGeometry(
        strText, {
            size: size,
            height: 2,
            curveSegments: 4,
            font: "helvetiker",
            weight: "normal",
            style: "normal",
            bevelThickness: 0.6,
            bevelSize: 0.25,
            bevelEnabled: true,
            material: 0,
            extrudeMaterial: 1
        }
    ); 
    var menuMaterial = new THREE.MeshFaceMaterial(
        [
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.FlatShading
            }), // front
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                shading: THREE.SmoothShading
            }) // side
        ]
    );
    var menuMesh = new THREE.Mesh(menuGeometry, menuMaterial);
    menuMesh.position.set(posX, posY, posZ);
    menuMesh.rotation.set(rotateX, rotateY, rotateZ);
    menuMesh.castShadow = true;
    menuMesh.receiveShadow = true;
    var group = new THREE.Object3D();
    group.add(menuMesh);
    scene.add(group);
    meshArray.push({meshGroup:group,name:name});
   
 }

 function addLights() {
     //Add Lights Here
     var spotLight = new THREE.SpotLight(0xffffff);
    //var spotLight = new THREE.DirectionalLight(0x999999);
    //spotLight.position.set(0, 0, 70);
    spotLight.position.set(70, 70, 70);
    spotLight.shadowCameraVisible = false;
    spotLight.castShadow = true;
    spotLight.shadowMapWidth = spotLight.shadowMapHeight = 512;
    spotLight.shadowDarkness = 0.7;
    scene.add(spotLight);
    //var ambientLight = new THREE.AmbientLight(0x222222);
    //var ambientLight = new THREE.AmbientLight(0x444444);
    var ambientLight = new THREE.AmbientLight(0x666666);
    //var ambientLight = new THREE.AmbientLight(0x888888);
    //var ambientLight = new THREE.AmbientLight(0xbbbbbb);
    scene.add(ambientLight);
 }

 function addSTLModel(parameters) { //(filename, meshName, meshSize) {
     parameters = parameters || {};
     var path = parameters.path;
     var meshSizeX = parameters.meshSizeX;
     var meshSizeY = parameters.meshSizeY;
     var meshSizeZ = parameters.meshSizeZ;
     var tx = parameters.translateX;
     var ty = parameters.translateY;
     var tz = parameters.translateZ;
     var meshName = parameters.meshGroupName;
     var color = parameters.color;
     if (parameters.meshSizeX === undefined || parameters.meshSizeY === undefined || parameters.meshSizeZ === undefined) {
         meshSizeX = 1;
         meshSizeY = 1;
         meshSizeZ = 1;
     }
     if(color === undefined){
       color = 0xffffff;
     }
     var xhr1 = new XMLHttpRequest();
     xhr1.onreadystatechange = function() {
         if (xhr1.readyState == 4) {
             if (xhr1.status == 200 || xhr1.status === 0) {
                 var rep = xhr1.response;
                 var mesh1;
                 mesh1 = parseStlBinary(rep, color);
                 mesh1.material.side = THREE.DoubleSide;
                 mesh1.castShadow = true;
                 mesh1.receiveShadow = true;
                 mesh1.material.metal = true;
                 mesh1.scale.set(meshSizeX, meshSizeY, meshSizeZ);
                 mesh1.position.set(tx, ty, tz);
                 var group = new THREE.Object3D();
                 group.add(mesh1);
                 scene.add(group);
                 meshArray.push({
                     meshGroup: group,
                     name: meshName
                 });
                 // newMeshReady = true;
             }
         }
     };
     xhr1.onerror = function(e) {
         console.log(e);
     };
     xhr1.open("GET", path, true);
     xhr1.responseType = "arraybuffer";
     xhr1.send(null);
 }

function LEIA_setBackgroundPlane(filename, aspect) {
    var foregroundPlaneTexture = new THREE.ImageUtils.loadTexture(filename);
    foregroundPlaneTexture.wrapS = foregroundPlaneTexture.wrapT = THREE.RepeatWrapping;
    foregroundPlaneTexture.repeat.set(1, 1);

    //
    var planeMaterial = new THREE.MeshPhongMaterial({
        map: foregroundPlaneTexture,
        color: 0xffdd99
    });
    var planeGeometry = new THREE.PlaneGeometry(100, 75, 10, 10);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.z = -6;
    plane.castShadow = false;
    plane.receiveShadow = true;
    scene.add(plane);
}

