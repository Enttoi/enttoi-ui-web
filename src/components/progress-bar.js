import {bindable, inject, noView} from 'aurelia-framework';
import nprogress from 'rstacruz/nprogress';

@noView
export class ProgressBar {
    @bindable loading = true;

    constructor()
    {
        nprogress.configure({ showSpinner: false });
    }
    
	loadingChanged() {
		if (this.loading)
			nprogress.start();
		else
			nprogress.done();
	}
}