import Route from '@ember/routing/route';

export default Route.extend({
  actions: {
    error(error) {
      if (error) {
        console.error(error);
      }

      this.intermediateTransitionTo('not-found', { path: undefined });
    },

    willTransition() {
      this.set('nav.hidden', false);
    }
  },

  model() {
    return this.modelFor('human');
  },

  afterModel(model) {
    if (model && model.get('name') && model.get('name').trim()) {
      this.set('headData.title', model.get('name'));
    } else {
      this.get('headData').setDefaultTitle();
    }
  }
});
