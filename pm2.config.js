
module.exports = {
  apps : [
      {
          name: 'sdchain-rest',
          script: './index.js',
          args: '--max-old-space-size=4096',
      }
  ],
};

