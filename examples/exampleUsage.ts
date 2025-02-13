import { createReactiveState } from '../src/core/reactive';
import { Watcher } from '../src/core/reactive/watcher';

interface UserState {
  user: {
    name: string;
    age: number;
    preferences: {
      theme: string;
      notifications: boolean;
    };
  };
  posts: string[];
}

function ExampleUsage() {
	const {state, createRef, computed} = createReactiveState<UserState>({
		user: {
			name: 'John',
			age: 30,
			preferences: {
				theme: 'dark',
				notifications: true
			}
		},
		posts: []
	});

	const count = createRef<number>(0);
	const userSummary = computed(() => {
		return `${state.user.name} ${state.user.age}`
	});

	new Watcher(state.user, 'name', (newValue: string, oldValue: string) => {
		console.log(`Name changed from ${oldValue} to ${newValue}`)
	})

	state.user.name = 'Jane';
	count.value++;
	console.log(userSummary.value);
}


