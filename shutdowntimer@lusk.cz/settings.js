const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const KEY_DELAY = "delay";
const KEY_ELAPSED_TIME = "elapsed-time";
const KEY_FORCED = "forced";
const KEY_ACTION = "action";

/**
 * This class takes care of reading/writing the settings from/to the GSettings backend.
 * @type {Lang.Class}
 */
const Settings = new Lang.Class({
    Name: 'Settings',

    _schemaName: "org.gnome.shell.extensions.shutdowntimer",
    /**
     * The GSettings-object to read/write from/to.
     * @private
     */
    _setting: {},

    /**
     * Creates a new Settings-object to access the settings of this extension.
     * @private
     */
    _init: function(){
        let schemaDir = Me.dir.get_child('schemas').get_path();

        let schemaSource = Gio.SettingsSchemaSource.new_from_directory(
            schemaDir, Gio.SettingsSchemaSource.get_default(), false
        );
        let schema = schemaSource.lookup(this._schemaName, false);

        this._setting = new Gio.Settings({
            settings_schema: schema
        });
    },

    /**
     * <p>Binds the given 'callback'-function to the "changed"-signal on the given
     *  key.</p>
     * <p>The 'callback'-function is passed an argument which holds the new
     *  value of 'key'. The argument is of type "GLib.Variant". Given that the
     *  receiver knows the internal type, use one of the get_XX()-methods to get
     *  it's actual value.</p>
     * @see http://www.roojs.com/seed/gir-1.2-gtk-3.0/gjs/GLib.Variant.html
     * @param key the key to watch for changes.
     * @param callback the callback-function to call.
     */
    bindKey: function(key, callback){
        // Validate:
        if (key === undefined || key === null || typeof key !== "string"){
            throw TypeError("The 'key' should be a string. Got: '"+key+"'");
        }
        if (callback === undefined || callback === null || typeof callback !== "function"){
            throw TypeError("'callback' needs to be a function. Got: "+callback);
        }
        // Bind:
        this._setting.connect("changed::"+key, function(source, key){
            callback( source.get_value(key) );
        });
    },

    /**
     * Get the forced option status
     * @returns bool
     */
    getForced: function(){
        return this._setting.get_boolean(KEY_FORCED);
    },

    /**
     * Set the forced option
     * @param boolean
     * @throws TypeError if the given param is not a boolean value
     */
    setForced: function(status){
        // Validate:
        if (status === undefined || status === null || typeof status !== "boolean"){
            throw TypeError("status should be a boolean. Got: "+status);
        }
        // Set:
        let key = KEY_FORCED;
        if (this._setting.is_writable(key)){
            if (this._setting.set_boolean(key, status)){
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    },

    /**
     * Get the default action to be taken when timer hits.
     * @returns int action id.
     */
    getAction: function(){
        return this._setting.get_int(KEY_ACTION);
    },

    /**
     * Set the preferred action to be taken when timer hits.
     * @param action id.
     * @throws TypeError if the given action is not a number or less than 0
     */
    setAction: function(action){
        // Validate:
        if (action === undefined || action === null || typeof action !== "number" || action < 0){
            throw TypeError("action should be a number, equal or greater than 0. Got: "+action);
        }
        // Set:
        let key = KEY_ACTION;
        if (this._setting.is_writable(key)){
            if (this._setting.set_int(key, action)){
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    },    

    /**
     * Get the delay (in minutes) to shutdown.
     * @returns int the delay in minutes.
     */
    getDelay: function(){
        return this._setting.get_int(KEY_DELAY);
    },

    /**
     * Set the new delay in minutes.
     * @param delay the new delay (in minutes).
     * @throws TypeError if the given delay is not a number or less than 1
     */
    setDelay: function(delay){
        // Validate:
        if (delay === undefined || delay === null || typeof delay !== "number" || delay <= 1){
            throw TypeError("delay should be a number, greater than 1. Got: "+delay);
        }
        // Set:
        let key = KEY_DELAY;
        if (this._setting.is_writable(key)){
            if (this._setting.set_int(key, delay)){
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    },


    /**
     * Get the time (in minutes), which has already elapsed from the last set timeout-interval.
     * @return int the elapsed time in minutes.
     */
    getElapsedTime: function(){
        return this._setting.get_int(KEY_ELAPSED_TIME);
    },

    /**
     * Set the time (in minutes) which has elapsed from the last set timeout-interval.
     * @param time the time (in minutes) that has elapsed.
     * @throws TypeError if 'time' wasn't a number or less than 0.
     */
    setElapsedTime: function(time){
        // Validate:
        if (time === undefined || time === null || typeof time != "number" || time < 0){
            throw TypeError("'time' needs to be a number, greater than 0. Given: "+time);
        }
        // Write:
        if (this._setting.is_writable(KEY_ELAPSED_TIME)){
            if (this._setting.set_int(KEY_ELAPSED_TIME, time)){
                Gio.Settings.sync();
            } else {
                throw this._errorSet(key);
            }
        } else {
            throw this._errorWritable(key);
        }
    },

    _errorWritable: function(key){
        return "The key '"+key+"' is not writable.";
    },
    _errorSet: function(key){
        return "Couldn't set the key '"+key+"'";
    }
});
