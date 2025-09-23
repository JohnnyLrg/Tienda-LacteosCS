import { Routes } from '@angular/router';
import { authGuard, publicGuard, adminGuard, authOnlyGuard, superAdminGuard } from './controller/guards/auth.guard';

export const routes: Routes = [
    // Rutas públicas (sin autenticación)
    {
        path: 'login',
        canActivate: [publicGuard],
        loadComponent: () => import('./view/components/auth/login/login.component'),
        title: 'Iniciar Sesión'
    },
    {
        path: 'register',
        canActivate: [publicGuard],
        loadComponent: () => import('./view/components/auth/register/register.component'),
        title: 'Registrarse'
    },

    // Ruta para seleccionar empresa (solo autenticación, sin empresa)
    {
        path: 'seleccionar-empresa',
        canActivate: [authOnlyGuard],
        loadComponent: () => import('./view/components/auth/seleccionar-empresa/seleccionar-empresa.component'),
        title: 'Seleccionar Empresa'
    },

    // Dashboard público de la empresa (catálogo de productos del sistema comercial)
    {
        path: 'tienda',
        loadComponent: () => import('./view/components/principal/principal.component'),
        children: [
            { path: 'home', loadComponent: () => import('./view/pages/inicio/inicio.component'), title: 'Inicio' },
            { path: 'productos', loadComponent: () => import('./view/pages/productos/productos.component'), title: 'Productos' },
            { path: 'pedido', loadComponent: () => import('./view/pages/productos/pedido/pedido.component'), title: 'Realizar Pedido' },
            { path: 'envios', loadComponent: () => import('./view/pages/envios/envios.component'), title: 'Mis Pedidos' },
            { path: '', redirectTo: '/tienda/home', pathMatch: 'full' },
            { path: '**', redirectTo: '/tienda/home', pathMatch: 'full' }
        ]
    },

    // Dashboard administrativo de la empresa (requiere autenticación y empresa)
    {
        path: 'empresa',
        canActivate: [authGuard],
        loadComponent: () => import('./view/admin/components/principal/principal.component'),
        children: [
            { path: 'dashboard', loadComponent: () => import('./view/admin/pages/inicio/inicio.component'), title: 'Dashboard' },
            
            // Gestión de inventario
            { path: 'inventario', loadComponent: () => import('./view/admin/pages/inventario/inventario.component'), title: 'Inventario' },
            { path: 'historial-inventario', loadComponent: () => import('./view/admin/pages/Historial/Historial.component'), title: 'Historial Inventario' },
            
            // Gestión de clientes
            { path: 'clientes', loadComponent: () => import('./view/admin/pages/clientes/clientes.component'), title: 'Clientes' },
            
            // Comunicación
            { path: 'chats', loadComponent: () => import('./view/admin/pages/consultas/consultas.component'), title: 'Atención al Cliente' },
            {
                path: 'conversaciones',
                loadComponent: () => import('./view/admin/pages/Conversaciones/Conversaciones.component'),
                title: 'Gestión de Conversaciones',
                children: [
                    { path: 'listar', loadComponent: () => import('./view/admin/pages/Conversaciones/listar-conversacion/listar-conversacion.component'), title: 'Todas las Conversaciones' },
                    { path: 'buscar', loadComponent: () => import('./view/admin/pages/Conversaciones/buscar-conversacion/buscar-conversacion.component'), title: 'Buscar Conversaciones' },
                    { path: '', redirectTo: '/empresa/conversaciones/listar', pathMatch: 'full' },
                    { path: '**', redirectTo: '/empresa/conversaciones/listar', pathMatch: 'full' }
                ]
            },
            
            // Administración (solo para admins)
            { 
                path: 'trabajadores', 
                canActivate: [adminGuard],
                loadComponent: () => import('./view/admin/pages/trabajadores/trabajadores.component'), 
                title: 'Gestión de Empleados' 
            },
            { 
                path: 'informes', 
                canActivate: [adminGuard],
                loadComponent: () => import('./view/admin/pages/informes/informes.component'), 
                title: 'Informes y Estadísticas' 
            },
            
            // Perfil de usuario
            { path: 'perfil', loadComponent: () => import('./view/shared/Perfil/Perfil.component'), title: 'Mi Perfil' },
            
            // Redirects
            { path: '', redirectTo: '/empresa/dashboard', pathMatch: 'full' },
            { path: '**', redirectTo: '/empresa/dashboard', pathMatch: 'full' }
        ]
    },

    // Dashboard Super Administrador (requiere permisos especiales)
    {
        path: 'super-admin',
        canActivate: [superAdminGuard],
        children: [
            { path: 'dashboard', loadComponent: () => import('./view/super-admin/pages/dashboard-super-admin.component'), title: 'Dashboard Super Admin' },
            { path: 'gestionar-empresas', loadComponent: () => import('./view/super-admin/pages/gestionar-empresas.component'), title: 'Gestionar Empresas' },
            { path: '', redirectTo: '/super-admin/dashboard', pathMatch: 'full' },
            { path: '**', redirectTo: '/super-admin/dashboard', pathMatch: 'full' }
        ]
    },

    // Redirects principales
    {
        path: '',
        redirectTo: '/tienda/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: '/tienda/home',
        pathMatch: 'full'
    }
];
