var gulp = require('gulp');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var zip    = require('gulp-zip');


gulp.task('build:plugin', function() {
  gulp.src(['./src/equation_editor/events.js',
            './src/equation_editor/view.js',
            './src/equation_editor/collapsible_view.js',
            './src/equation_editor/button_views.js',
            './src/equation_editor/button_group_view.js',
            './src/equation_editor/button_view_factory.js',
            './src/equation_editor/button_group_view_factory.js',
            './src/equation_editor/equation_editor_view.js',
            './src/equation_editor/menu.js',
            './src/plugin.js'
    ])
    .pipe(babel({
            babelrc: false,
            presets: ['env']
        }))
    //.pipe(uglify())
    .pipe(concat('plugin.min.js')) // include "min" in the filename to please TinyMCE
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
    .pipe(concat('plugin.js')) // include "min" in the filename to please TinyMCE
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))

  // equation_editor.js with out tinymce plugin init is needed for equation_editor.html.
  gulp.src(['./src/equation_editor/events.js',
            './src/equation_editor/view.js',
            './src/equation_editor/collapsible_view.js',
            './src/equation_editor/button_views.js',
            './src/equation_editor/button_group_view.js',
            './src/equation_editor/button_view_factory.js',
            './src/equation_editor/button_group_view_factory.js',
            './src/equation_editor/equation_editor_view.js',
            './src/equation_editor/menu.js'
    ])
    .pipe(babel({
            babelrc: false,
            presets: ['env']
        }))
    //.pipe(uglify())
    .pipe(concat('equation_editor.min.js'))
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
    .pipe(concat('equation_editor.js'))
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
});

gulp.task('build:equation_editor_html', function() {
  gulp.src('./src/equation_editor.html')
    .pipe(concat('equation_editor.html'))
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
  gulp.src('./src/equation_editor.css')
    .pipe(concat('equation_editor.css'))
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
});

gulp.task('build:copy_config', function() {
  gulp.src('./src/equation_editor/config.json')
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
});

gulp.task('build:copy_mathquill', function() {
  gulp.src('./mathquill/build/mathquill.min.js')
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
  gulp.src('./mathquill/build/mathquill.css')
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
  gulp.src(['./mathquill/build/fonts/**/*'])
      .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/fonts/'));
});

gulp.task('build:zip', function() {
  gulp.src(['./build/fonts/*',
            './build/js/tinymce/plugins/mobileequationeditor/equation_editor.js',
            './build/js/tinymce/plugins/mobileequationeditor/mathquill.min.js',
            './build/js/tinymce/plugins/mobileequationeditor/plugin.min.js',
            './build/js/tinymce/plugins/mobileequationeditor/equation_editor.css',
            './build/js/tinymce/plugins/mobileequationeditor/equation_editor.html',
            './build/js/tinymce/plugins/mobileequationeditor/mathquill.css',
            './build/js/tinymce/plugins/mobileequationeditor/config.json'
    ])
    .pipe(zip('tinymce_equation_editor.zip'))
    .pipe(gulp.dest('./build/'))
});

gulp.task('debug:plugin', function() {
  gulp.src(['./src/equation_editor/events.js',
            './src/equation_editor/view.js',
            './src/equation_editor/collapsible_view.js',
            './src/equation_editor/button_views.js',
            './src/equation_editor/button_group_view.js',
            './src/equation_editor/button_view_factory.js',
            './src/equation_editor/button_group_view_factory.js',
            './src/equation_editor/equation_editor_view.js',
            './src/equation_editor/menu.js',
            './src/plugin.js'
    ])
    .pipe(babel({
            babelrc: false,
            presets: ['env']
        }))
    //.pipe(uglify())
    .pipe(concat('plugin.min.js')) // include "min" in the filename to please TinyMCE
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
    .pipe(concat('plugin.js')) // include "min" in the filename to please TinyMCE
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
});

gulp.task('debug:copy_mathquill', function() {
  gulp.src('./mathquill/build/mathquill.js')
    .pipe(concat('mathquill.min.js'))
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
  gulp.src('./mathquill/build/mathquill.css')
    .pipe(gulp.dest('./build/js/tinymce/plugins/mobileequationeditor/'))
});

gulp.task('build:copy_tinymce', function() {
  gulp.src(['./node_modules/tinymce/**/*'])
      .pipe(gulp.dest('./build/js/tinymce/'));
});

gulp.task('watch', ['debug:plugin', 'debug:equation_editor', 'build:copy_config'], function () {
    gulp.watch(['src/equation_editor/'+'*.js', 'src/'+'*js', 'src/equation_editor/'+'*.json'], ['debug:plugin', 'debug:equation_editor', 'build:copy_config']);
});

gulp.task('build', ['build:equation_editor_html', 'build:plugin', 'build:copy_config', 'build:copy_mathquill', 'build:copy_tinymce', 'build:zip']);
gulp.task('debug', ['build:equation_editor_html', 'debug:plugin', 'build:copy_config', 'debug:copy_mathquill']);
