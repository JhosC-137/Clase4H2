import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-login-vr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-vr.component.html',
  styleUrl: './login-vr.component.css'
})
export class LoginVRComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private skybox!: THREE.Mesh;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;
  private isBrowser: boolean;
  private imageUrl: string = 'https://i.ytimg.com/vi/W1j5iHviJKw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCc5TDsfgIpzCg2siGYjOSPJspjZg';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Obtener la URL de la imagen del parámetro de ruta
    this.route.queryParams.subscribe(params => {
      if (params['imageUrl']) {
        this.imageUrl = decodeURIComponent(params['imageUrl']);
        console.log('URL de imagen cargada:', this.imageUrl);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.initThreeJS();
      this.initControls();
      this.animate();
    }
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.controls) {
      this.controls.dispose();
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

    
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.SphereGeometry(100, 64, 64);
    
    
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(
      this.imageUrl,
      (texture) => {
        console.log('Textura panorámica cargada exitosamente desde:', this.imageUrl);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        });

        this.skybox = new THREE.Mesh(geometry, material);
        this.scene.add(this.skybox);
      },
      undefined,
      (error) => {
        console.warn('Error al cargar imagen desde', this.imageUrl, error);
        // Fallback: intentar cargar imagen por defecto
        textureLoader.load(
          '/assets/ciudad360.jpeg',
          (texture) => {
            const material = new THREE.MeshBasicMaterial({
              map: texture,
              side: THREE.BackSide
            });
            this.skybox = new THREE.Mesh(geometry, material);
            this.scene.add(this.skybox);
          },
          undefined,
          (fallbackError) => {
            console.warn('Error al cargar fallback', fallbackError);
            // Segundo fallback
            textureLoader.load(
              '/assets/crash.png',
              (texture) => {
                const material = new THREE.MeshBasicMaterial({
                  map: texture,
                  side: THREE.BackSide
                });
                this.skybox = new THREE.Mesh(geometry, material);
                this.scene.add(this.skybox);
              },
              undefined,
              (finalError) => {
                console.error('Error al cargar todas las texturas:', finalError);
                // Color sólido
                const material = new THREE.MeshBasicMaterial({
                  color: 0x1a1a1a,
                  side: THREE.BackSide
                });
                this.skybox = new THREE.Mesh(geometry, material);
                this.scene.add(this.skybox);
              }
            );
          }
        );
      }
    );

    // Manejar resize de ventana
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initControls(): void {
    // Inicializar OrbitControls para exploración 360°
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    // Configuración de controles
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 1.0;
    this.controls.enablePan = false;
    this.controls.autoRotate = true;           // ← ROTACIÓN AUTOMÁTICA
    this.controls.autoRotateSpeed = 2;         // ← Velocidad de rotación (2°/frame)
    
    // Límites de distancia
    this.controls.minDistance = 0.1;
    this.controls.maxDistance = 100;
    
    // Limitar rotación vertical
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI;
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    // Actualizar controles (incluyendo rotación automática)
    this.controls.update();

    // Renderizar la escena
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
