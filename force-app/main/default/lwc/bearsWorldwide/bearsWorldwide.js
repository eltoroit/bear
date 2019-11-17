import { LightningElement, api, track, wire } from 'lwc';
import getAllBears from '@salesforce/apex/BearController.getAllBears';

export default class BearTab extends LightningElement {
	@track mapMarkers;
	@api markersTitle = 'Bears Worldwide';
	@api listView='visible';

	@wire(getAllBears)
	wired_getLocations({ error, data }) {
		this.mapMarkers = [];
		if (data) {
			data.forEach(loc => {
				this.mapMarkers.push({

                    location: {
                        Latitude: loc.Location__Latitude__s,
                        Longitude: loc.Location__Longitude__s
                    },

                    description: 'Bears around the world.',
                    title: loc.Name,
				});
			});

		} else if (error) {
			this.error = error;
		}
	}
}