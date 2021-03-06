import Component from '@ember/component';
import { computed, observer } from '@ember/object';
import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNameBindings: [
    'model.hasDirtyAttributes:hasDirtyAttributes',
    'model.isSaving:isSaving',
    'savedRecently',
    'optionsShown',
    'store.editable:editMode:viewMode',
    'session.human:shown:hidden'
  ],
  classNames: ['store'],
  optionsShown: true,
  router: service(),
  tagName: 'nav',
  timeout: 5000,

  hasChanges: computed('model.{hasDirtyAttributes,hasContent,isNew}', function() {
    return this.get('model.hasDirtyAttributes') && (this.get('model.hasContent') || !this.get('model.isNew'));
  }),

  isDeleting: computed('model.{isSaving,isDeleting}', function() {
    return (this.get('model.isSaving') && this.get('model.isDeleted'));
  }),

  isNotDeleted: computed('model.isDeleted', function() {
    return !this.get('model.isDeleted');
  }),

  isSaving: computed('model.{isSaving,isDeleted}', function() {
    return (this.get('model.isSaving') && !this.get('model.isDeleted'));
  }),

  savingChanged: observer('model.isSaving', function() {
    if (this.get('model.isSaving')) {
      this.set('hasSaved', true);
      return;
    }

    this.set('savedRecently', true);

    run.later(() => {
      if (!this.get('isDestroyed')) {
        this.set('savedRecently', false);

        run.later(() => {
          this.set('hasSaved', false);
        }, 250);
      }
    }, this.get('timeout'));
  }),

  showDelete: computed('canDelete', 'model.isNew', function() {
    return (this.get('canDelete') && !this.get('model.isNew'));
  }),

  actions: {
    delete() {
      this.get('model').destroyRecord().then(() => {
        this.set('model.destroyed', true);

        let done = () => {
          this.get('model').unloadRecord();
        };

        this.get('router').transitionTo('index').then(done).catch(done);
      });
    },

    toggleMode(editable) {
      this.set('store.editable', editable);
    },

    toggleOptions() {
      this.toggleProperty('optionsShown');
    },

    save() {
      if (this.get('model.isNew')) {
        this.set('model.createdAt', new Date());
        this.set('model.publishedAt', new Date());
      }

      this.set('model.updatedAt', new Date());
      this.get('store').queueSave(this.get('model'));
    }
  }
});
