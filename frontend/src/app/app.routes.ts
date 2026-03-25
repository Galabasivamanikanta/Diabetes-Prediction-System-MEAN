import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { HomeComponent } from './home.component';
import { PredictionComponent } from './prediction.component';
import { HistoryComponent } from './history.component';
import { AnalyticsComponent } from './analytics.component';
import { ProfileComponent } from './profile.component';
import { WellnessComponent } from './wellness.component';
import { WearableComponent } from './wearable.component';

export const routes: Routes = [
    { path: 'login', component: AuthComponent },
    { path: 'home', component: HomeComponent },
    { path: 'predict', component: PredictionComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'analytics', component: AnalyticsComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'wellness', component: WellnessComponent },
    { path: 'wearable', component: WearableComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
