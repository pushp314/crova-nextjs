
module.exports = {
  apps: [
    {
      name: 'crova-nextjs',
      script: 'npm',
      args: 'start',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NEXTAUTH_URL: 'https://crova.in',
        DATABASE_URL: 'postgresql://admin:admin123@localhost:5432/crovadb?schema=public',
      },
    },
  ],
};
