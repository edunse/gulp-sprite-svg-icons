# gulp-sprite-svg-icons

Usage:
```javascript
const spriteIcons = require('gulp-sprite-svg-icons');

gulp.task('icon', function () {
    return gulp.src('src/icons/*.svg')
        .pipe(spriteIcons({
            monoSuffix: ".mono", // default .mono
            output: {
                sprite: '/assets/icons.svg', // relative to dest (defalt 'icons.svg')
                styles: '/scss/icons.scss', // relative to dest (defalt 'icons.scss')
            }
        }))
        .pipe(gulp.dest('src'));
});
```
