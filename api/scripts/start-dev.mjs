import 'dotenv/config';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`PORT must be a valid TCP port; received "${process.env.PORT}".`);
}

const probe = createServer();
probe.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Travelie API cannot start: port ${port} is already in use. Reuse the running API or stop it before starting another instance.`,
    );
    process.exitCode = 1;
    return;
  }
  throw error;
});

probe.listen({ port, host: '::', exclusive: true }, () => {
  probe.close((error) => {
    if (error) throw error;

    const nestCli = resolve(
      apiDirectory,
      'node_modules',
      '@nestjs',
      'cli',
      'bin',
      'nest.js',
    );
    const child = spawn(process.execPath, [nestCli, 'start', '--watch'], {
      cwd: apiDirectory,
      env: process.env,
      stdio: 'inherit',
    });

    child.once('error', (spawnError) => {
      console.error('Failed to start the NestJS development server.', spawnError);
      process.exitCode = 1;
    });
    child.once('exit', (code, signal) => {
      process.exitCode = code ?? (signal ? 1 : 0);
    });
  });
});
