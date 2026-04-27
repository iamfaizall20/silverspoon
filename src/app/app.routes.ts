import { Routes } from '@angular/router';
import { Landingpage } from './pages/landingpage/landingpage';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Order } from './pages/order/order';
import { Adminlayout } from './pages/adminlayout/adminlayout';
import { Dashboard } from './components/dashboard/dashboard';
import { Orders } from './components/manageOrders/manageOrders';
import { Products } from './components/products/products';
import { Users } from './components/users/users';
import { Newsletter } from './components/newsletter/newsletter';
import { Offers } from './components/offers/offers';
import { Settings } from './components/settings/settings';

export const routes: Routes = [

    // User Pages
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Landingpage },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'order/new', component: Order },

    // Admin Pages
    {
        path: 'admin', component: Adminlayout, children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'orders', component: Orders },
            { path: 'products', component: Products },
            { path: 'users', component: Users },
            { path: 'newsletter', component: Newsletter },
            { path: 'offers', component: Offers },
            { path: 'settings', component: Settings },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

        ]
    }
];
