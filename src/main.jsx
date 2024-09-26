import React from 'react'
import ReactDOM, { createRoot } from 'react-dom/client'
import App from './App'
import MyComponent from './Ape'
import Layout from './components/Layout';

import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Layout>
            <MyComponent />
        </Layout>
    </React.StrictMode>,
)
