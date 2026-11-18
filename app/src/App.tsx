import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from '@/router';
import { store } from '@/store/store';

const App = () => (
	<Router>
		<Provider store={store}>
			<AppRoutes />
		</Provider>
	</Router>
);

export default App;
