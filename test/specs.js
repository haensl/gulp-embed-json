const join = require('path').join;
const expect = require('chai').expect;
const gulp = require('gulp');
const through = require('through2');
const fs = require('fs');
const embedJSON = require('../');
const fixtures = (glob) => join(__dirname, 'fixtures', glob);

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
        expect(/"foo": "bar"/.test(output)).to.be.true;
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
        expect(/"foo": "bar"/.test(output)).to.be.true;
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
    it('throws an exception', () => {
      expect(() => gulp.src(fixtures('nonexistent-src.html'))
        .pipe(embedJSON())).to.throw;
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
          expect(/type="foo\/bar">{ "foo": "bar" }/.test(output)).to.be.true;
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
          expect(/type="foo\/bar">{ "foo": "bar" }/.test(output)).to.be.true;
        });

        it('does not process scripts with different mime type', () => {
          expect(/type="application\/json" src="/.test(output)).to.be.true;
        });
      });

      describe('non string or Array<string>', () => {
        it('throws an exception', () => {
          expect(() => gulp.src(fixtures('opt-mime.html'))
            .pipe(embedJSON({
              mimeTypes: {
                foo: 'bar'
              }
            }))).to.throw;
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
            expect(/{ "foo": "bar" }/.test(output)).to.be.true;
          });
        });

        describe('invalid path', () => {
          it('throws an exception', () => {
            expect(() => gulp.src(fixtures('opt-root.html'))
              .pipe(embedJSON({
                root: './test/does-not-exist'
              }))).to.throw;
          });
        });
      });

      describe('non string', () => {
        it('throws an exception', () => {
          expect(() => gulp.src(fixtures('opt-root.html'))
            .pipe(embedJSON({
              root: {
                foo: 'bar'
              }
            }))).to.throw;
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
          expect(/"foo": "bar"/.test(output)).to.be.true;
        });

        it('removes the src attribute', () => {
          expect(/src=/.test(output)).to.be.false;
        });
      });

      describe('non string', () => {
        it('throws an exception', () => {
          expect(() => gulp.src(fixtures('json.html'))
            .pipe(embedJSON({
              encoding: {
                foo: 'bar'
              }
            }))).to.throw;
        });
      });
    });
  });
});