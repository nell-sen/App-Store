import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AdminProvider } from './context/AdminContext.tsx';
import { FavoritesProvider } from './context/FavoritesContext.tsx';

import {ThemeProvider} from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AdminProvider>
        <FavoritesProvider>
          <App />
        </FavoritesProvider>
      </AdminProvider>
    </ThemeProvider>
  </StrictMode>,
);
