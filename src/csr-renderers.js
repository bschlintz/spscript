var templating = require("mustache");

function createTemplateRenderer(htmlTemplate, events) {
    return function(ctx) {
        return templating.render(htmlTemplate, ctx);
    }
}

function createFormFieldRenderer(field) {
    return function(ctx) {
        var formCtx = ctx.FormContext;
        if (field.onReady) {
            formCtx.registerInitCallback(field.name, field.onReady)
        }
        if (field.getValue) {
            formCtx.registerGetValueCallback(field.name, field.getValue.bind(null, ctx));
        }
        // tack on 'setValue' function
        if (formCtx.updateControlValue) {
            field.setValue = function(value) {
                formCtx.updateControlValue(field.name, value);
            }            
        }

        return field.render(ctx);
    }
}

function createDisplayFieldRenderer(field) {
    return function(ctx) {
        var formCtx = ctx.FormContext;
        if(formCtx && formCtx.registerInitCallback && field.onReady) {
            formCtx.registerInitCallback(field.name, field.onReady)
        }
        return field.render(ctx);
    }
}

var renderers = {
    template: {
        create: createTemplateRenderer
    },
    formField : {
        create: createFormFieldRenderer
    },
    displayField: {
        create: createDisplayFieldRenderer
    }
}

module.exports = renderers;