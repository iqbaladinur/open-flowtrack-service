module.exports = {
  apps: [
    {
      name: 'wallport-api',
      script: 'dist/src/main.js',
      instances: 1, // Creates one instance per CPU core
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // Should be false in production
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
