import fs from 'fs';
import path from 'path';

export default async function hasBuildScript(repoPath, scriptName = 'build') {
    try {
        console.log("repoPath = ", repoPath)
        const pkgPath = path.join(repoPath, 'package.json');
        console.log("pkgPath = ", pkgPath)
        const pkgData = fs.readFileSync(pkgPath, 'utf-8');
        console.log("pkgData = ", pkgData)
        const pkg = JSON.parse(pkgData);
        console.log("pkg = ", pkg)

        if (pkg.scripts && pkg.scripts[scriptName]) {
            console.log(`✅ Build script found: ${pkg.scripts[scriptName]}`);
            return true;
        } else {
            console.log('❌ No build script found.');
            return false;
        }
    } catch (err) {
        console.error('Error reading package.json:', err.message);
        return false;
    }
}