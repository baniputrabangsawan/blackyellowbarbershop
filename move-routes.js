/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const adminDir = '/home/baniputrabangsawan/project-web/yellow-barbershop-makassar/src/app/admin';
const protectedDir = path.join(adminDir, '(protected)');

if (!fs.existsSync(protectedDir)) {
  fs.mkdirSync(protectedDir);
}

const itemsToMove = [
  'page.tsx',
  'admin-queue-client.tsx',
  'layout.tsx',
  'services',
  'barbers',
  'memberships',
  'settings'
];

itemsToMove.forEach(item => {
  const oldPath = path.join(adminDir, item);
  const newPath = path.join(protectedDir, item);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${item} to (protected)/`);
  }
});
