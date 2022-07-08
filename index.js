const svgSprite = require('gulp-svg-sprite');
const DOMParser = require('xmldom').DOMParser;

const defs = new DOMParser().parseFromString('<defs></defs>');
let count = 0;

module.exports = function (opts) {
  const options = opts || {};

  options.monoSuffix = options.monoSuffix || '.mono';
  options.spriteFilename = options.spriteFilename || 'icons.svg';
  options.output = options.output || {};
  options.output.sprite = options.output.sprite || 'icons.svg';
  options.output.styles = options.output.styles || 'icons.scss';

  const monoIcons = {};

  return svgSprite({
    shape: {
      id: {
        generator: function (name) {
          name = 'icon-' + name.replace('.svg', '');
          if (name.indexOf(options.monoSuffix) >= 0) {
            name = name.replace(options.monoSuffix, '');
            monoIcons[name] = {};
          }
          return name;
        }
      },
      transform: [
        gradientsExtraction,
        'svgo',
        function (shape, sprite, callback) {
          let newSVG = shape.svg.current;
          if (monoIcons[shape.id]) {
            newSVG = newSVG.replace(/<svg[^>]+(fill="none")/, function (fullMatch, fillMatch) {
              return fullMatch.replace(fillMatch, '');
            });
            newSVG = newSVG.replace(/fill="([^"]+)"/g, function (match, color) {
              if (color !== 'none' && !monoIcons[shape.id].fill) {
                monoIcons[shape.id].fill = color;
              }
              return monoIcons[shape.id].fill && color === monoIcons[shape.id].fill ? '' : match;
            });
            // delete fill attribute for groups
            // newSVG.replace(/<g[^>]+(fill="#[^"]+")/, function (fullMatch, fillMatch) {
            //   return fullMatch.replace(fillMatch, '');
            // });
          }
          newSVG = newSVG.replace(/<title>[^>]*<\/title>/g, '');
          shape.setSVG(newSVG);
          callback(null);
        }
      ]
    },
    svg: {
      transform: [
        function (svg) {
          return svg.replace(
            '<symbol ',
            defs.firstChild.toString() + '<symbol '
          );
        }
      ]
    },
    variables: {
      fillColor: function () {
        return monoIcons[this.name] ? monoIcons[this.name].fill : null;
      },
      hasMonoFill: function () {
        return monoIcons[this.name] !== undefined && !!monoIcons[this.name].fill;
      }
    },
    mode: {
      symbol: {
        inline: true,
        prefix: '.%s',
        dimensions: '%s',
        dest: '',
        sprite: options.output.sprite,
        render: {
          scss: {
            template: __dirname + '/icon-template.mustache',
            dest: options.output.styles //"../scss/icons.scss",
          }
        }
      }
    }
  });
};

function gradientsExtraction(shape, spriter, callback) {
  const idsToReplace = [].concat(
    extractGradients(shape, 'linearGradient'),
    extractGradients(shape, 'radialGradient')
  );

  shape.setSVG(updateUrls(shape.getSVG(), idsToReplace));

  callback(null);
}

function extractGradients(shape, tag) {
  const idsToReplace = [];

  const gradients = shape.dom.getElementsByTagName(tag);
  while (gradients.length > 0) {
    // Add gradient to defs block
    defs.documentElement.appendChild(gradients[0]);

    // Give gradient new ID
    const id = gradients[0].getAttribute('id');
    const newId = 'g' + (++count);
    gradients[0].setAttribute('id', newId);

    idsToReplace.push([id, newId]);
  }

  return idsToReplace;
}

function updateUrls(svg, idsToReplace) {
  for (var i = 0; i < idsToReplace.length; i++) {
    const str = 'url(#' + idsToReplace[i][0] + ')';
    svg = svg.replace(
      new RegExp(regexEscape(str), 'g'),
      'url(#' + idsToReplace[i][1] + ')'
    );
  }

  return svg;
}

function regexEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
