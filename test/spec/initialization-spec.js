describe('Connector/Initialize:', function() {
  var $wakanda, $rootScope, $q, unitTestsHelpers,
    intervalRef;

    before(function () {
      module('unitTestsHelpersModule');
      inject(function (_unitTestsHelpers_) {
        unitTestsHelpers = _unitTestsHelpers_;
        unitTestsHelpers.db.reset(false);
      });
    });

  beforeEach(function() {
    if(!$wakanda) {
      module('wakanda');
      inject(function(_$rootScope_, _$wakanda_, _$q_) {
          $q = _$q_;
          $rootScope = _$rootScope_;
          $wakanda = _$wakanda_;
          // https://github.com/domenic/chai-as-promised/issues/68
          intervalRef = setInterval(function(){ $rootScope.$apply(); }, 1);
      });
    }
  });

  describe('init() function', function() {
    it('should return a promise on $promise property', function (done) {
      var request = $wakanda.init();
      var promise = request.$promise;

      expect(request).to.have.property('$promise');
      expect(promise).to.be.a('promise');

      done();
    });
    it('should be defined and return a promise', function() {
      expect($wakanda.init).to.be.defined;
      expect($wakanda.init).to.be.a('function');
      expect($wakanda.init().then).to.be.a('function');
    });
    it('promise to be fulfilled if ds is found', function(done) {
      var $init = $wakanda.init();
      $init.should.be.fulfilled.then(function (ds) {
        expect(ds).to.be.an('object');
      }).should.notify(done);
    });
    it('promise to be rejected if ds is not found', function(done) {
      var $badInit = $wakanda.init('abc123cde456');
      $badInit.should.be.rejected.then(function(ds){
        expect(ds).to.be.an('object');
        var $correctInit = $wakanda.init('*');
        $correctInit.should.be.fulfilled.then(function (ds) {
          expect(ds).to.be.an('object');
        }).should.notify(done);
      })
    });
    it('promise should resolve return ds; if ds != null', function(done) {
      var $init = $wakanda.init(), firstDs, secondDs;
      $init.should.be.fulfilled.then(function (ds) {
        firstDs = ds;
        var $otherInit = $wakanda.init();
        $otherInit.should.be.fulfilled.then(function (ds) {
          secondDs = ds;
          expect(firstDs).to.be.deep.equal(secondDs);
        }).should.notify(done);
      })
    });

    it('should return different catalogs if called with different parameters', function (done) {
      $wakanda.init().$promise.then(function (fullDs) {
        $wakanda.init('Product').$promise.then(function (partialDs1) {
          expect(fullDs).not.to.be.deep.equal(partialDs1);

          $wakanda.init('Employee, Company').$promise.then(function (partialDs2) {
            expect(fullDs).not.to.be.deep.equal(partialDs2);
            expect(partialDs1).not.to.be.deep.equal(partialDs2);
            done();
          });
        });
      });
    });
  });

  //Deprecated tests
  describe('getDatastore() function', function() {
    it('should be defined and be a function', function() {
      expect($wakanda.getDatastore).to.be.defined;
      expect($wakanda.getDatastore).to.be.a('function');
    });
    it('should return the Datastore', function(done) {
      $wakanda.init().should.be.fulfilled.then(function (ds) {
        expect($wakanda.getDatastore()).to.be.defined;
        expect($wakanda.getDatastore()).to.be.deep.equal(ds);
      }).should.notify(done);
    });
    it('should throw an error if the ds is not found yet', function(done) {
      var $badInit = $wakanda.init('abc123cde456');
      $badInit.should.be.rejected.then(function(ds){
        try {
            $wakanda.getDatastore();
        } catch (Exception) {
            expect(Exception).to.be.an.instanceof(Error);
        }
      }).should.notify(done);
    });
    it('should have an alias $ds alias method', function(done) {
      $wakanda.init().should.be.fulfilled.then(function (ds) {
        expect($wakanda.$ds).to.be.defined;
        expect($wakanda.$ds).to.be.deep.equal(ds);
        expect($wakanda.$ds).to.be.deep.equal($wakanda.getDatastore());
      }).should.notify(done);
    });
    it('should have an alias $ds and throw an error if the Datastore is not defined yet', function(done) {
      $wakanda.init('abc123cde456').should.be.rejected.then(function (ds) {
        try {
            $wakanda.$ds;
            Assert.Fail();
        } catch (Exception) {
            expect(Exception).to.be.an.instanceof(Error);
        }
      }).should.notify(done);
    });
  });

  afterEach(function() {
    $wakanda = $rootScope = null;
    clearInterval(intervalRef);
  });

});
