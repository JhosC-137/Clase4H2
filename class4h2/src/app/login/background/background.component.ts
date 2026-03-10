import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';

@Component({
  selector: 'app-background',
  standalone: true,
  template: '<canvas #canvas class="three-canvas"></canvas>',
  styles: [`
    .three-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      display: block;
    }
  `]
})
export class BackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private plane!: THREE.Mesh;
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

  private initThreeJS(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Crear escena
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Crear cámara
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2.5;

    // Crear renderizador
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Cargar textura
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/assets/crash.png');

    // Crear geometría del plano
    const geometry = new THREE.PlaneGeometry(4, 2.25);

    // Crear material con la textura
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Crear plano
    this.plane = new THREE.Mesh(geometry, material);
    this.scene.add(this.plane);

    // Agregar luz ambiente para mejor visualización
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Manejar resize de ventana
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Rotar el plano suavemente
    this.plane.rotation.x += 0.003;
    this.plane.rotation.y += 0.005;

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
