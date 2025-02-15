import { Renderer } from '../src/core/jsx/renderer';

interface ButtonProps {
  onClick?: (e: MouseEvent) => void;
  className?: string;
  children?: any;
}

function Button({ onClick, className, children }: ButtonProps) {
  return (
    <button 
      class={className} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 4. Usage
const App = () => (
  <div class="app">
    <h1>Hello, Custom JSX!</h1>
    <Button 
      onClick={() => console.log('clicked')}
      className="primary-button"
    >
      Click me
    </Button>
  </div>
);

// 5. Render
const renderer = new Renderer();
renderer.render(
  <App />,
  document.getElementById('root')!
);