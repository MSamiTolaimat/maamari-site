import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';

// خطوط مستضافة ذاتيًا (بدل <link> إلى fonts.googleapis.com في index.html):
// كل وزن مطلوب فعليًا في index.css/الأقسام فقط، لتقليل حجم الحزمة.
//
// اقتران جديد: El Messiri للعناوين بدل Reem Kufi، وIBM Plex Sans
// Arabic للنص والواجهة بدل Tajawal. السبب مذكور في index.css عند
// تعريف اقتران الخطوط.
import '@fontsource/ibm-plex-sans-arabic/300.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/el-messiri/400.css';
import '@fontsource/el-messiri/500.css';
import '@fontsource/el-messiri/600.css';
import '@fontsource/el-messiri/700.css';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
