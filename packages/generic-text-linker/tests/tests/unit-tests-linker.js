/* eslint-env mocha */
// require('../../../../lib/test-common')
const stlc = require('../lib/string-to-line-increasing-checker')
const sttlm = require('../../src/substing-to-line-mapper')
const expect = require('chai').expect
require('chai').should()

describe('Testing', function () {
  describe('@linker', function () {
    const { linker } = require('../../src/index')
    it('test liner default behaviour', function () {
      const result = linker(`
      bla-bla
      AAA
      ---
      BBB
      
      alb-alb

      `, 'AAA', 'BBB', '+++')
      const { returnData } = result

      const { changed } = result.meta
      expect(changed.all).to.equal(true)
      expect(changed.withoutWhiteSpaces).to.equal(true)

      returnData.should.be.a('string').that.does.not.include('---')
      returnData.should.be.a('string').that.does.include('+++')
      // stlc(returnData, ['bla-bla', 'AAA', '+++', 'BBB', 'alb-alb'])
    })

    it('test liner default behaviour faulty tags', function () {
      const result = linker(`
      bla-bla
      AAA vv
      ---
      BBB nn
      
      alb-alb

      `, 'AAA', 'BBB', '+++')
      const { returnData } = result

      const { changed } = result.meta
      expect(changed.all).to.equal(false)

      returnData.should.be.a('string').that.does.include('---')
      returnData.should.be.a('string').that.does.not.include('+++')
    })

    it('test linker with more tags', function () {
      const linker = require('../../src/linker')
      const result = linker(`
      bla-bla
      AAA
      ---
      BBB
      
      AAA
      ---
      BBB
      
      alb-alb

      `, 'AAA', 'BBB', '+++')
      const { returnData } = result

      const { changed } = result.meta
      expect(changed.all).to.equal(true)
      expect(changed.withoutWhiteSpaces).to.equal(true)

      returnData.should.be.a('string').that.does.not.include('---')
      expect(sttlm(returnData, '+++')).to.have.property('length', 2)
      expect(sttlm(returnData, 'AAA')).to.have.property('length', 2)
      expect(sttlm(returnData, 'BBB')).to.have.property('length', 2)

      stlc(returnData, ['bla-bla', 'AAA', '+++', 'BBB', 'alb-alb'])
    })

    it('test linker with more tags (no change)', function () {
      const result = linker(`
      bla-bla
      AAA
      +++
      BBB
      
      AAA
      +++
      BBB
      
      alb-alb

      `, 'AAA', 'BBB', '+++')
      const { returnData } = result

      const { changed } = result.meta
      expect(changed.all).to.equal(true)
      expect(changed.withoutWhiteSpaces).to.equal(false)

      expect(sttlm(returnData, '+++')).to.have.property('length', 2)
      expect(sttlm(returnData, 'AAA')).to.have.property('length', 2)
      expect(sttlm(returnData, 'BBB')).to.have.property('length', 2)

      stlc(returnData, ['bla-bla', 'AAA', '+++', 'BBB', 'alb-alb'])
    })

    it('test @linker-return with more tags', function () {
      const result = linker(`
      bla-bla
      AAA
      ---
      BBB
      
      AAA
      ---
      BBB
      
      alb-alb

      `, 'AAA', 'BBB')
      const { returnData } = result

      const { changed } = result.meta
      expect(changed.all).to.equal(false)

      returnData.should.be.a('string').that.does.include('---')
      returnData.should.be.a('string').that.does.not.include('AAA')
    })

    it('no opening tag', function () {
      expect(function () {
        linker(`
              bla-bla
              ---
              BBB
              
              alb-alb
        
              `, 'AAA', 'BBB', '+++')
      }).to.throw('The number linker closing tags and starting tags are not matching')
    })

    it('no closing tag', function () {
      const linker = require('../../src/linker')
      expect(function () {
        linker(`
        bla-bla
        AAA
        ---
        
        alb-alb
  
        `, 'AAA', 'BBB', '+++')
      }).to.throw('The number linker closing tags and starting tags are not matching')
    })
  })
})
