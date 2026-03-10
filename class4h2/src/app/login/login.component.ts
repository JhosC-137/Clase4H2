import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cube!: THREE.Mesh;
  private animationFrameId: number | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initThreeJS();
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  playSound(): void {
    const audio = new Audio('/assets/sounds/Crash Bandicoot Whoa Death Sound Effect! (HQ).mp3');
    audio.play().catch(error => console.log('Error al reproducir sonido:', error));
  }

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Crear escena con fondo naranja de Crash Bandicoot
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    // Crear renderizador
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Crear geometría del cubo
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Crear material con color azul y naranja (tema Crash Bandicoot)
    const canvas2D = document.createElement('canvas');
    canvas2D.width = 256;
    canvas2D.height = 256;
    const ctx = canvas2D.getContext('2d');
    if (ctx) {
      // Azul intenso
      ctx.fillStyle = '#2980b9';
      ctx.fillRect(0, 0, 128, 128);
      // Naranja suave
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(128, 0, 128, 128);
      ctx.fillRect(0, 128, 128, 128);
      // Amarillo
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(128, 128, 128, 128);
    }
    const texture = new THREE.CanvasTexture(canvas2D);
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      emissive: 0xe67e22,
      shininess: 100
    });

    // Crear cubo
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    // Agregar luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Agregar luz direccional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Agregar luz puntual con color azul
    const pointLight = new THREE.PointLight(0x2980b9, 0.5);
    pointLight.position.set(-5, -5, 5);
    this.scene.add(pointLight);

    // Manejar resize de ventana
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Rotar el cubo
    this.cube.rotation.x += 0.005;
    this.cube.rotation.y += 0.008;
    this.cube.rotation.z += 0.003;

    // Renderizar
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
