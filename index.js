
const stateMachine = (() => {
    /**
     * @description util functionality object
     */
    const util = {
        /**
         * 
         * @param {string} s 
         */
        required(s = "it"){
            console.log(`${s} is required`)
        },
        /**
         * @description private function
         * @param {function} predicate 
         */
        _maybe(predicate){
            /**
             * @description function in function(lazy)
             * @param {array} value
             */
            return value => {
                return predicate(value )? value : []
            }
        },
        /**
         * @description private function
         * @param {array} arr 
         */
        _isArray(arr){
            return Array.isArray(arr)
        },
        /**
         * @param {array} arr 
         */
        maybeArr(arr){
            return this._maybe(this._isArray)(arr)
        }
    }  
    /**
     * @returns {object} { unsubscribe }
     */
    class Observer{
        /**
         * 
         * @param {object} handler 
         */
        constructor(handler){
            this.handler = handler;
            this.isUnsubscribed = false;
        }
        /**
         * @param {any} data 
         */
        next(data){
            //only execute while it is subscribing
            if(!this.isUnsubscribed){
                if(this.handler.next){
                    this.handler.next(data)
                }
            }
        }
        error(err){
            //only execute while it is subscribing
            if(!this.isUnsubscribed){
                if(this.handler.error){
                    this.handler.error(err)
                }
                //unsubscribe after error occured
                this.unsubscribe();
            }
        }
        complete(){
          //only execute while it is subscribing
          if(!this.isUnsubscribed){
              if(this.handler.complete){
                  this.handler.complete()
              }
              //unsubscribe after error occured
              this.unsubscribe()
          }  
        }

        unsubscribe(){
            this.isUnsubscribed  = true;
        }

    }

    class Observable{
        /**
         * 
         * @param {object} fn 
         */
        constructor(fn){
            this.fn = fn
        }
        /**
         * @description keep our observable lazy
         * it triggers a function
         * @param {function object} next 
         * @param {function} error 
         * @param {function} complete 
         * @returns {function} observer.unsubscribe()
         */
        subscribe(next = util.required(),error,complete){
            let result;
            if(typeof next === 'function'){
                result = {
                    next,
                    error:error || function(){},
                    complete:complete || function(){}
                }
            }else{
                result = next;
            }

            const observer = new Observer(result)
            this.fn(observer)
            return {
                dispose(){
                    observer.unsubscribe()
                }
            }
        }
        /**
         * higher order observable
         * observable in observable
         * @param {function} projectFn
         * @returns {Observable}
         */
        map(projectFn = util.required()){
            /**
             * @param {object} observer
             */
            return new Observable(observer => {
                this.subscribe({
                    next(data){
                        try{
                            observer.next(projectFn(data))
                        }  
                        catch(err){
                            observer.error(err)
                        }
                    },
                    error(err){
                        observer.error(err)
                    },
                    complete(){
                        observer.complete()
                    }
                })
            })
        }
        /**
         * @param {function} predicate 
         * @returns {Observable}
         */
        filter(predicate = util.required()){
            /**
             * @param {object} observer
             */
            return new Observable(observer => {
                this.subscribe({
                    /**
                     * @param {any} data 
                     */
                    next(data){
                       try{
                        if(predicate(data)){
                            observer.next(data)
                        }
                       }
                       catch(err){
                           observer.error(err)
                       }
                    },
                    error(err){
                        observer.error(err)
                    },
                    complete(){
                        observer.complete()
                    }
                })
            })
        }
        /**
         * 
         * @param {function} predicate 
         * @param {function} projectfn 
         */
        filterMap(predicate = util.required(),projectfn = util.required()){
            return new Observable(observer => {
                this.subscribe({
                    next(data){
                        try{
                         if(predicate(data)){
                             observer.next(projectfn(data))
                         }
                        }
                        catch(err){
                            observer.error(err)
                        }
                     },
                     error(err){
                         observer.error(err)
                     },
                     complete(){
                         observer.complete()
                     } 
                })
            })
        }
        /**
         * 
         * @param {function} fn
         * @returns {Observable} 
         */
        promise(fn = util.required()){
            /**
             * @param {object} observer
             */
            return new Observable(observer => {
                this.subscribe({
                    async next(data){
                        try{
                            const s = await fn(data)
                            observer.next(s)
                        }catch(err){
                            observer.error(err)
                        }
                    },
                    error(err){
                        observer.error(err)
                    },
                    complete(){
                        observer.complete()
                    } 
                })
            })
        }
        /**
         * 
         * @param {function} fn 
         * @returns {Observable} 
         */
        fromPromise(fn = util.required()){
            return new Observable(async observer => {
                try{
                    const data = await fn();
                    observer.next(data)
                    observer.complete()
                }catch(err){
                    observer.error(err)
                }
            })
       }
       /**
        * 
        * @param {array} arr 
        * @returns {Observable} 
        */
        static from(arr){
        return new Observable(observer => {
            try{
                const newArr = util.maybeArr(arr);
                newArr.forEach(value => observer.next(value))
                observer.complete()
            }catch(err){
                observer.error(err)
            }
        })
       }
    }


    return{
        Observable
    }
})()


module.exports = stateMachine





