import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        hot: true
    },
    css: {
        preprocessorOptions: {
            scss: {
                includePaths: ["node_modules", "./src/assets"],
            },
        }
    },
    loaders: [{ test: /\.css$/, loader: 'style-loader!css-loader' }]
})
