import { build } from "esbuild";
import { copyFileSync, mkdirSync, cpSync } from "fs";

// Crear carpeta dist
mkdirSync("dist", { recursive: true });

// Copiar HTML y CSS
copyFileSync("src/index.html", "dist/index.html");
copyFileSync("src/generator.html", "dist/generator.html");
cpSync("src/css", "dist/css", { recursive: true });
cpSync("src/libs", "dist/libs", { recursive: true });

// Minificar cada JS por separado
const jsFiles = ["app", "auth", "login", "session"];
jsFiles.forEach(file => {
    build({
        entryPoints: [`src/js/${file}.js`],
        bundle: true,
        minify: true,
        outfile: `dist/${file}.min.js`,
    }).catch(() => process.exit(1));
});
