module.exports = {
  presets: [
    '@babel/preset-typescript',
    ['@babel/preset-react', {
      pragma: 'createElement',
      pragmaFrag: 'Fragment'
    }]
  ],
  plugins: [
    './src/core/jsx/babel-plugin-custom-jsx.ts'
  ]
};