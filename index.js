
import * as THREE from './node_modules/three/build/three.module.js';
class Arrow {
    constructor(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, fletchingColor, cockVaneColor, wrapColor, wrapLength, nockColor) {
        this.length = length;
        this.outerDiameter = outerDiameter;
        this.numberOfVanes = numberOfVanes;
        this.vaneDistanceFromBack = vaneDistanceFromBack;
        this.fletchingColor = fletchingColor;
        this.cockVaneColor = cockVaneColor;
        this.wrapColor = wrapColor;
        this.wrapLength = wrapLength;
        this.nockColor = nockColor;
        this.createGeometry(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, fletchingColor, cockVaneColor, wrapColor, wrapLength, nockColor);
    }
    destroy() {
        scene.remove(this.group);
    }
    createGeometry(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, vaneColor, cockVaneColor, wrapColor, wrapLength, nockColor) {
        this.group = new THREE.Group();

        this.shaft = this.createGenericShaft(outerDiameter, length, 0x444444, wrapColor, wrapLength);

        this.tip = this.createGenericPinPointTip(50, outerDiameter);
        this.tip.position.set(0, length / 2 + 0.25, 0);

        this.vanes = this.createGenericVanes(null, numberOfVanes, vaneColor, cockVaneColor, 3, vaneDistanceFromBack, length, outerDiameter);
        this.nock = this.createGenericNock(outerDiameter, 0.4, nockColor, length)


        this.group.add(this.tip, this.shaft, this.vanes, this.nock);
        this.group.rotation.z += 90;

        scene.add(this.group);
    }

    createGenericShaft(outerDiameter, length, shaftColor, wrapColor, wrapLength) {

        const geometry = new THREE.CylinderGeometry(outerDiameter / 2, outerDiameter / 2, length, 8);
        let uvTex = this.createShaftTexture(shaftColor, wrapColor, wrapLength, length);
        uvTex.anisotropy = renderer.getMaxAnisotropy();
        var material = new THREE.MeshPhongMaterial({ map: uvTex });
        const shaft = new THREE.Mesh(geometry, material);
        return shaft;
    }
    createShaftTexture(shaftColor, WrapColor, wrapLength, shaftLength) {
        let width = 1;
        let height = 2048;
        let size = width * height;

        const data = new Uint8Array(4 * size);

        const wrapColorRGB = new THREE.Color(WrapColor);
        const shaftColorRGB = new THREE.Color(shaftColor);

        let r = Math.floor(wrapColorRGB.r * 255);
        let g = Math.floor(wrapColorRGB.g * 255);
        let b = Math.floor(wrapColorRGB.b * 255);

        let wrapPixels = size * (wrapLength / shaftLength);
        for (let i = 0; i < wrapPixels; i++) {
            const stride = i * 4;
            data[stride] = r;
            data[stride + 1] = g;
            data[stride + 2] = b;
            data[stride + 3] = 255;
        }
        r = Math.floor(shaftColorRGB.r * 255);
        g = Math.floor(shaftColorRGB.g * 255);
        b = Math.floor(shaftColorRGB.b * 255);
        for (let i = wrapPixels; i < size; i++) {
            const stride = i * 4;
            data[stride] = r;
            data[stride + 1] = g;
            data[stride + 2] = b;
            data[stride + 3] = 255;
        }
        let texture = new THREE.DataTexture(data, width, height);
        texture.needsUpdate = true;
        return texture;
    }

    createGenericPinPointTip(weight, outerDiameter) {
        const tipGeometry = new THREE.CylinderGeometry(0, outerDiameter / 2, 0.5, 8);
        const tipMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        return new THREE.Mesh(tipGeometry, tipMaterial);
    }
    createGenericVanes(type, amount, color, cockVaneColor, length, position, shaftLength, outerDiameter) {
        const angleOffset = 2 * Math.PI / amount;
        let vanes = new THREE.Object3D();
        let radius = -outerDiameter / 2;
        for (let i = 0; i < amount; i++) {
            if (i == amount - 1) color = cockVaneColor;
            let vaneMaterial = new THREE.MeshPhongMaterial({ color: color });
            let vane = this.createGenericTriangleVane(length, vaneMaterial);

            vane.position.set(radius * Math.sin(angleOffset * i), -shaftLength / 2 + position, radius * Math.cos(angleOffset * i));
            vane.rotation.y += angleOffset * i;
            vanes.add(vane);

        }
        return vanes;
    }
    createGenericTriangleVane(length, vaneMaterial) {
        const x = 0, y = 0;

        const triangleShape = new THREE.Shape();

        triangleShape.moveTo(x, y);
        triangleShape.lineTo(x - length, y);
        triangleShape.lineTo(x, length / 5);
        triangleShape.lineTo(x, y);
        const geometry = new THREE.ExtrudeGeometry(triangleShape, {
            steps: 1,
            depth: 0.01,
            bevelEnabled: false
        });
        const vane = new THREE.Mesh(geometry, vaneMaterial);
        vane.rotation.z -= Math.PI / 2;
        vane.rotation.y += Math.PI / 2;
        return vane;
    }
    createGenericNock(outerDiameter, length, color, shaftLength) {
        const geometry = new THREE.CylinderGeometry(outerDiameter / 2, outerDiameter / 3, length, 8);
        var material = new THREE.MeshPhongMaterial({ color: color });

        let nock = new THREE.Mesh(geometry, material);
        nock.position.y = -shaftLength / 2 - length / 2;
        return nock;
    }


}


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);



const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(200, 500, 300);
scene.add(directionalLight)
let arrow = new Arrow(28, 0.204, 3, 1, "#0000FF", "#00ffff", 0xffff00, 6.5,"#ff0000");

camera.position.z = 30;


function animate() {
    requestAnimationFrame(animate);
    // shaft.rotation.z += 0.01;
    arrow.group.rotation.y += 0.01;
    arrow.vanes.rotation.y += 0.02;

    renderer.render(scene, camera);
}
animate();


// arrow = new Arrow(arrow.length, arrow.outerDiameter, arrow.numberOfVanes, arrow.vaneDistanceFromBack, arrow.vaneColor, arrow.cockVaneColor);

let inputs = document.getElementsByTagName("input");
for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("change", function (event) {
        let input = event.target;
        arrow.destroy();
        if (input.id == "wrapColor") arrow.wrapColor = input.value;
        if (input.id == "fletchingColor") arrow.fletchingColor = input.value;
        if (input.id == "cockVaneColor") arrow.cockVaneColor = input.value;
        if (input.id == "nockColor") arrow.nockColor = input.value;
        if(input.id =="length") arrow.length = input.value;
        if(input.id == "diameter") arrow.outerDiameter = input.value;

        arrow = new Arrow(arrow.length, arrow.outerDiameter, arrow.numberOfVanes, arrow.vaneDistanceFromBack, arrow.fletchingColor, arrow.cockVaneColor, arrow.wrapColor, arrow.wrapLength, arrow.nockColor);
    })
}