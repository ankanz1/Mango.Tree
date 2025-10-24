#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * Start all blockchain services
 */
async function startAllServices() {
  console.log('Starting Mango Tree Blockchain Services...');

  // Start the solver service
  const solverProcess = spawn('node', ['index.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  solverProcess.on('error', (error) => {
    console.error('Failed to start solver service:', error);
    process.exit(1);
  });

  solverProcess.on('exit', (code) => {
    console.log(`Solver service exited with code ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down services...');
    solverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\nShutting down services...');
    solverProcess.kill('SIGTERM');
  });

  console.log('All blockchain services started successfully');
}

// Start services
startAllServices().catch(error => {
  console.error('Failed to start services:', error);
  process.exit(1);
});


