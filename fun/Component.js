import {reactive} from './reactivity'
export class Component {
	constructor(props = {}) {
		this.props = props;
		this.state = reactive({})
	}
	onMount() {}
	onUpdate() {}
	onUnmount() {}
	render() {
		return null;
	}
}