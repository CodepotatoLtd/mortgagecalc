let mix = require('laravel-mix');
require('laravel-mix-purgecss');

/*
 |--------------------------------------------------------------------------
 | Elixir Asset Management
 |--------------------------------------------------------------------------
 |
 | Elixir provides a clean, fluent API for defining some basic Gulp tasks
 | for your Laravel application. By default, we are compiling the Sass
 | file for our application, as well as publishing vendor resources.
 |
 */

mix.sass('resources/assets/sass/app.scss', 'public/css')
    .copy('resources/views/index.html', 'public')
    .js('resources/assets/js/app.js', 'public/js')
    .purgeCss();