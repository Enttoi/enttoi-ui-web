import {bindable, inject, noView} from 'aurelia-framework';
import nprogress from 'rstacruz/nprogress';

@noView
export class ProgressBar {
    @bindable loading = true;

	loadingChanged() {
		if (this.loading)
			nprogress.start();
		else
			nprogress.done();
	}
}