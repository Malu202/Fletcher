
import * as THREE from './node_modules/three/build/three.module.js';
let animationRunning = false;
class Arrow {
    constructor(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, fletchingColor, cockVaneColor, wrapColor, wrapLength, nockColor, fletchingGeometry, fletchingSize) {
        this.length = length;
        this.outerDiameter = outerDiameter;
        this.numberOfVanes = numberOfVanes;
        this.vaneDistanceFromBack = vaneDistanceFromBack;
        this.fletchingColor = fletchingColor;
        this.cockVaneColor = cockVaneColor;
        this.wrapColor = wrapColor;
        this.wrapLength = wrapLength;
        this.nockColor = nockColor;
        this.fletchingGeometry = fletchingGeometry;
        this.fletchingSize = fletchingSize
        this.createGeometry(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, fletchingColor, cockVaneColor, wrapColor, wrapLength, nockColor, fletchingGeometry, fletchingSize);
    }
    destroy() {
        scene.remove(this.group);
    }
    createGeometry(length, outerDiameter, numberOfVanes, vaneDistanceFromBack, vaneColor, cockVaneColor, wrapColor, wrapLength, nockColor, fletchingGeometry, fletchingSize) {
        this.group = new THREE.Group();

        this.shaft = this.createGenericShaft(outerDiameter, length, 0x444444, wrapColor, wrapLength);

        this.tip = this.createGenericPinPointTip(50, outerDiameter);
        this.tip.position.set(0, length / 2 + 0.25, 0);


        this.nock = this.createGenericNock(outerDiameter, 0.4, nockColor, length);
        let self = this;
        this.createGenericVanes(null, numberOfVanes, vaneColor, cockVaneColor, fletchingSize, vaneDistanceFromBack, length, outerDiameter, fletchingGeometry, function (vanes) {
            self.vanes = vanes;

            self.group.add(self.tip, self.shaft, self.vanes, self.nock);
            self.group.rotation.x += 90;
            scene.add(self.group);


            startAnimation();
        });


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
    createGenericVanes(type, amount, color, cockVaneColor, length, position, shaftLength, outerDiameter, fletchingGeometry, callback) {
        const angleOffset = 2 * Math.PI / amount;
        let vanes = new THREE.Object3D();
        let radius = -outerDiameter / 2;
        let createdVanes = 0;
        for (let i = 0; i < amount; i++) {
            if (i == amount - 1) color = cockVaneColor;
            let vaneMaterial = new THREE.MeshPhongMaterial({ color: color });

            if (!fletchingGeometry) {
                let vane = this.createGenericTriangleVane(length, vaneMaterial);
                vane.position.set(radius * Math.sin(angleOffset * i), -shaftLength / 2 + position, radius * Math.cos(angleOffset * i));
                vane.rotation.y += angleOffset * i;
                vanes.add(vane);
                createdVanes++;
                if (createdVanes == amount) callback(vanes);
            }
            else generateFletchingShape(length, fletchingGeometry, vaneMaterial, function (vane) {
                vane.position.set(radius * Math.sin(angleOffset * i), -shaftLength / 2 + position, radius * Math.cos(angleOffset * i));
                vane.rotation.y += angleOffset * i;
                vanes.add(vane);
                createdVanes++;
                if (createdVanes == amount) callback(vanes);
            });


        }
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
        nock.position.y = -shaftLength / 2 - length / 2 - 0.01;
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
let arrow = new Arrow(28, 0.204, 3, 1, "#FFFF00", "#000000", "#FFFF00", 6.5, "#FFFF00", null, 1.75);

camera.position.z = 30;

let start;
function animate(timestamp) {
    if (start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;
    start = timestamp;
    if (animationRunning) requestAnimationFrame(animate);
    else return;
    arrow.group.rotation.z -= 0.001 * elapsed;
    arrow.vanes.rotation.y -= 0.002 * elapsed;

    renderer.render(scene, camera);
}


function startAnimation() {
    animationRunning = true;
    requestAnimationFrame(animate);
}
function stopAnimation() {
    animationRunning = false;
}
startAnimation();

let inputs = document.getElementsByTagName("input");
for (let i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener("change", function (event) {
        let input = event.target;
        stopAnimation();
        arrow.destroy();
        if (input.id == "wrapColor") arrow.wrapColor = input.value;
        if (input.id == "fletchingColor") arrow.fletchingColor = input.value;
        if (input.id == "cockVaneColor") arrow.cockVaneColor = input.value;
        if (input.id == "nockColor") arrow.nockColor = input.value;
        if (input.id == "length") arrow.length = input.value;
        if (input.id == "diameter") arrow.outerDiameter = input.value;
        if (input.id == "wrapLength") arrow.wrapLength = input.value;
        if (input.id == "numberOfVanes") arrow.numberOfVanes = input.value;
        if (input.id == "fletchingShape") arrow.fletchingGeometry = input.files[0];
        if (input.id == "fletchingSize") arrow.fletchingSize = input.value;
        if (input.id == "fletchingPosition") arrow.vaneDistanceFromBack = parseFloat(input.value);



        arrow = new Arrow(arrow.length, arrow.outerDiameter, arrow.numberOfVanes, arrow.vaneDistanceFromBack, arrow.fletchingColor, arrow.cockVaneColor, arrow.wrapColor, arrow.wrapLength, arrow.nockColor, arrow.fletchingGeometry, arrow.fletchingSize);
    })
}
let threshold = document.getElementById("threshold");
let fletchingShapePreview = document.getElementById("fletchingShapePreview");
let fletchingShapePreviewContext = fletchingShapePreview.getContext("2d");
fletchingShapePreview.width = fletchingShapePreview.clientWidth;
fletchingShapePreview.height = fletchingShapePreview.clientHeight;
fletchingShapePreviewContext.fillStyle = "white";
fletchingShapePreviewContext.fillRect(0, 0, fletchingShapePreview.width, fletchingShapePreview.height);
let flipFletching = document.getElementById("flip");

function generateFletchingShape(length, file, vaneMaterial, callback) {

    var img = new Image;
    img.onload = function () {
        fletchingShapePreviewContext.fillRect(0, 0, fletchingShapePreview.width, fletchingShapePreview.height);
        if (flipFletching.checked) {
            fletchingShapePreviewContext.save();
            fletchingShapePreviewContext.translate(fletchingShapePreview.width, 0);
            fletchingShapePreviewContext.scale(-1, 1);
        }
        let canvasAspectRatio = fletchingShapePreview.width / fletchingShapePreview.height;
        let imageAspectRatio = img.width / img.height;
        if (imageAspectRatio > canvasAspectRatio) fletchingShapePreviewContext.drawImage(img, 0, 0, fletchingShapePreview.width, fletchingShapePreview.width / imageAspectRatio);
        else fletchingShapePreviewContext.drawImage(img, 0, 0, fletchingShapePreview.height * imageAspectRatio, fletchingShapePreview.height);
        if (flipFletching.checked) {
            fletchingShapePreviewContext.restore();
        }

        let blackAndWhiteImage = fletchingShapePreviewContext.getImageData(0, 0, fletchingShapePreview.width, fletchingShapePreview.height);

        let lowestPoint = 0;
        for (let i = 0; i < blackAndWhiteImage.data.length; i += 4) {
            let count = blackAndWhiteImage.data[i] + blackAndWhiteImage.data[i + 1] + blackAndWhiteImage.data[i + 2];
            let colour = 0;
            if (count > 255 * 3 * threshold.value) colour = 255;
            else lowestPoint = i;

            blackAndWhiteImage.data[i] = colour;
            blackAndWhiteImage.data[i + 1] = colour;
            blackAndWhiteImage.data[i + 2] = colour;
            blackAndWhiteImage.data[i + 3] = 255;
        }
        fletchingShapePreviewContext.fillRect(0, 0, fletchingShapePreview.width, fletchingShapePreview.height);
        fletchingShapePreviewContext.putImageData(blackAndWhiteImage, 0, blackAndWhiteImage.height - lowestPoint / (4 * blackAndWhiteImage.width));
        blackAndWhiteImage = fletchingShapePreviewContext.getImageData(0, 0, fletchingShapePreview.width, fletchingShapePreview.height)

        let yContour = [];
        for (let x = 0; x < fletchingShapePreview.width; x++) {
            for (let y = 0; y < fletchingShapePreview.height; y++) {
                let i = (x + y * blackAndWhiteImage.width) * 4;
                if (blackAndWhiteImage.data[i] < 128) {
                    yContour.push(y / blackAndWhiteImage.height);
                    break;
                }
            }
            if (yContour.length != x + 1) yContour.push(1);
        }
        fletchingShapePreviewContext.strokeStyle = "red";
        fletchingShapePreviewContext.beginPath();
        fletchingShapePreviewContext.moveTo(0, yContour[0] * blackAndWhiteImage.height)
        let stepsize = 1 / (yContour.length-1);
        for (let i = 1; i < yContour.length; i++) {
            let x = i * stepsize * blackAndWhiteImage.width;
            fletchingShapePreviewContext.lineTo(x, yContour[i] * blackAndWhiteImage.height);
        }
        fletchingShapePreviewContext.closePath();
        fletchingShapePreviewContext.stroke();

        let fletchingLeadingEdgeIndex=0;
        for(let i = 0; i<yContour.length-1;i++){
            if(yContour[i+1]!=1){
                fletchingLeadingEdgeIndex = i;
                break;
            }
        }
        let fletchingTrailingEdgeIndex = yContour.length-1;
        for(let i = yContour.length-1; i>0;i--){
            if(yContour[i-1]!=1){
                fletchingTrailingEdgeIndex = i;
                break;
            }
        }
        yContour = yContour.slice(fletchingLeadingEdgeIndex, fletchingTrailingEdgeIndex+1);
        stepsize = 1 / (yContour.length-1);

        let vaneShape = new THREE.Shape();

        vaneShape.moveTo(-length, (1 - yContour[0]) * length);
        console.log("Move to: " + 0 + ", " + (1 - yContour[0]) * length);

        for (let i = 1; i < yContour.length; i++) {
            let x = i * stepsize * length - length;
            vaneShape.lineTo(x, (1 - yContour[i]) * length);
            console.log("Line to: " + x + ", " + (1 - yContour[i]) * length)
        }
        vaneShape.lineTo(0, (1 - yContour[0]) * length);

        const geometry = new THREE.ExtrudeGeometry(vaneShape, {
            steps: 1,
            depth: 0.01,
            bevelEnabled: false
        });
        const vane = new THREE.Mesh(geometry, vaneMaterial);
        vane.rotation.z -= Math.PI / 2;
        vane.rotation.y += Math.PI / 2;
        callback(vane);
    }
    img.src = URL.createObjectURL(file);
}
