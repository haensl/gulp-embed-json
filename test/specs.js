const join = require('path').join;
const expect = require('chai').expect;
const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const embedJSON = require('../');

const fixtures = (glob) => join(__dirname, 'fixtures', glob);

const invalidOptionRegex = /invalid option/i;
const isInvalidOption = (str) => invalidOptionRegex.test(str);

describe('gulp-embed-json', () => {
  describe('script with src attribute', () => {
    let output;

    describe('and mime type application/json', () => {
      beforeEach((done) => {
        gulp.src(fixtures('json.html'))
          .pipe(embedJSON())
          .pipe(through.obj((file) => {
            output = file.contents.toString();
            done();
          }));
      });

      it('inserts the JSON data into the script tag', () => {
        expect(/"foo":"bar"/.test(output)).to.be.true;
      });

      it('removes the src attribute', () => {
        expect(/src=/.test(output)).to.be.false;
      });
    });

    describe('and mime type application/ld+json', () => {
      beforeEach((done) => {
        gulp.src(fixtures('ld+json.html'))
          .pipe(embedJSON())
          .pipe(through.obj((file) => {
            output = file.contents.toString();
            done();
          }));
      });

      it('inserts the JSON data into the script tag', () => {
        expect(/"foo":"bar"/.test(output)).to.be.true;
      });

      it('removes the src attribute', () => {
        expect(/src=/.test(output)).to.be.false;
      });
    });
  });

  describe('no script tag', () => {
    let output;
    let input;

    beforeEach((done) => {
      input = fs.readFileSync(fixtures('no-script.html'), 'utf8');
      gulp.src(fixtures('no-script.html'))
        .pipe(embedJSON())
        .pipe(through.obj((file) => {
          output = file.contents.toString();
          done();
        }));
    });

    it('bypasses the input', () => {
      expect(output).to.equal(input);
    });
  });

  describe('no input', () => {
    it('does not throw', () => {
      expect(embedJSON).not.to.throw;
    });
  });

  describe('nonexistent src', () => {
    let error;
    
    beforeEach((done) => {
      gulp.src(fixtures('nonexistent-src.html'))
        .pipe(embedJSON())
        .on('error', (err) => {
          error = err;
          done();
        }).on('end', done);
    });

    it('emits an invalid source error', () => {
      expect(/invalid source/i.test(error.message)).to.be.true;
    });
  });

  describe('options', () => {
    describe('mimeTypes', () => {
      let output;

      describe('Array<string>', () => {
        beforeEach((done) => {
          gulp.src(fixtures('opt-mime.html'))
            .pipe(embedJSON({
              mimeTypes: [
                'foo/bar'
              ]
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('processes scripts with the given mime type', () => {
          expect(/type="foo\/bar">{"foo":"bar"}/.test(output)).to.be.true;
        });

        it('does not process scripts with different mime type', () => {
          expect(/type="application\/json" src="/.test(output)).to.be.true;
        });
      });

      describe('string', () => {
        beforeEach((done) => {
          gulp.src(fixtures('opt-mime.html'))
            .pipe(embedJSON({
              mimeTypes: 'foo/bar'
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('processes scripts with the given mime type', () => {
          expect(/type="foo\/bar">{"foo":"bar"}/.test(output)).to.be.true;
        });

        it('does not process scripts with different mime type', () => {
          expect(/type="application\/json" src="/.test(output)).to.be.true;
        });
      });

      describe('non string or Array<string>', () => {
        let error;

        beforeEach((done) => {
          gulp.src(fixtures('opt-mime.html'))
            .pipe(embedJSON({
              mimeTypes: {
                foo: 'bar'
              }
            })).on('error', (err) => {
              error = err;
              done();
            }).on('end', done);
        });

        it('emits an invalid option error', () => {
          expect(isInvalidOption(error.message)).to.be.true;
        });
      });
    });

    describe('root', () => {
      let output;

      describe('string', () => {
        describe('valid path', () => {
          beforeEach((done) => {
            gulp.src(fixtures('opt-root.html'))
              .pipe(embedJSON({
                root: './test/fixtures'
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('searches for the json file in the given folder', () => {
            expect(/{"foo":"bar"}/.test(output)).to.be.true;
          });
        });

        describe('invalid path', () => {
          let error;
          
          beforeEach((done) => {
            gulp.src(fixtures('opt-root.html'))
              .pipe(embedJSON({
                root: './test/does-not-exist'
              })).on('error', (err) => {
                error = err;
                done();
              }).on('end', done);
          });

          it('emits an invalid option error', () => {
            expect(isInvalidOption(error.message)).to.be.true;
          });
        });
      });

      describe('non string', () => {
        let error;
        
        beforeEach((done) => {
          gulp.src(fixtures('opt-root.html'))
            .pipe(embedJSON({
              root: {
                foo: 'bar'
              }
            })).on('error', (err) => {
              error = err;
              done();
            }).on('end', done);
        });

        it('emits an invalid option error', () => {
          expect(isInvalidOption(error.message)).to.be.true;
        });
      });
    });

    describe('minify', () => {
      describe('boolean', () => {
        let output;
        describe('true', () => {
          beforeEach((done) => {
            gulp.src(fixtures('json.html'))
              .pipe(embedJSON({
                minify: true
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('minifies the json data', () => {
            expect(/{"foo":"bar"}/.test(output)).to.be.true;
          });
        });

        describe('false', () => {
          beforeEach((done) => {
            gulp.src(fixtures('json.html'))
              .pipe(embedJSON({
                minify: false
              }))
              .pipe(through.obj((file) => {
                output = file.contents.toString();
                done();
              }));
          });

          it('does not minify the json data', () => {
            expect(/{ "foo": "bar" }/.test(output)).to.be.true;
          });
        });
      });

      describe('non-boolean', () => {
        let error;
        
        beforeEach((done) => {
          gulp.src(fixtures('json.html'))
            .pipe(embedJSON({
              minify: {
                foo: 'bar'
              }
            })).on('error', (err) => {
              error = err;
              done();
            });
        });

        it('emits an invalid option error', () => {
          expect(isInvalidOption(error.message)).to.be.true;
        });
      });
    });

    describe('encoding', () => {
      describe('string', () => {
        let output;

        beforeEach((done) => {
          gulp.src(fixtures('opt-encoding.html'))
            .pipe(embedJSON({
              encoding: 'ascii'
            }))
            .pipe(through.obj((file) => {
              output = file.contents.toString();
              done();
            }));
        });

        it('inserts the JSON data into the script tag', () => {
          expect(/"foo":"bar"/.test(output)).to.be.true;
        });

        it('removes the src attribute', () => {
          expect(/src=/.test(output)).to.be.false;
        });
      });

      describe('non string', () => {
        let error;

        beforeEach((done) => {
          gulp.src(fixtures('json.html'))
            .pipe(embedJSON({
              encoding: {
                foo: 'bar'
              }
            })).on('error', (err) => {
              error = err;
              done();
            }).on('end', done);
        });

        it('emits an invalid option error', () => {
          expect(isInvalidOption(error.message)).to.be.true;
        });
      });
    });
  });
});

