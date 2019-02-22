
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
       /**
        * 
        * @param  {...any} args 
        */
       static of(...args){
        return new Observable(observer => {
            try{
                args.forEach(value => observer.next(value))
                observer.complete()
            }catch(err){
                observer.error(err)
            }
        })
       }
       /**
        * 
        * @param {number} num 
        */
       retry(num = 0){
           let counter = 1;
           return new Observable(observer => {
                try{
                    const x = {
                        next(data){
                            observer.next(data)
                        },
                        error(err){
                            if(counter === num){
                                observer.error(err)
                                return
                            }
                            else if(num === 0){
                                observer.error(err)
                                return;
                            }
                            counter++
                            this.subscribe(x)
                        },
                        complete(){
                            observer.complete()
                        }
                    }
                    this.subscribe(x)
                }
                catch(err){
                    observer.error(err)
                }
           })
       }
    }

    class State{
        /**
         * 
         * @param {object} state 
         */
        constructor(state = {}){
            this.state = state
            this.prev = null;
            this.next = null;
        }

        get getState(){
            return this.state
        }
    }

    class LinkedState{
        /**
         * @var {object | null } this.head 
         * @var {object | null} this.tail  
         * @var {number} this.length
         */
        constructor(){
            this.head = null;
            this.tail = null;
            this.length = 0;
        }
        //add to last
        insert(state = util.required()){
            const store = new State(state)
            //there is no state inserted yet
            if(this.length === 0){
                this.head = store;
                this.tail = store;
                this.length++
                return;
            }
            else if(this.length === 1){
                this.tail = store;
                this.head.next = this.tail
                this.tail.prev = this.head
                this.length++
                return
            }
            //there is a node
            const prevTail = this.tail
            this.tail = store;
            this.tail.prev = prevTail
            prevTail.next = this.tail
            this.length++
        }
        /**
         * @returns {object | null} state
         */
        shift(){
            //there is nothing
            if(this.length === 0) return null
            //remove the last standing state
            else if(this.length === 1){
                const prevState = this.head;
                this.head = null
                this.tail = null
                this.length = 0
                return prevState.getState;
            }
            //there is more than 1
            const prevHead = this.head
            this.head = prevHead.next;
            this.length--;
            return prevHead.getState
        }
        //remove current state
        /**
         * @returns {object | null} state
         */
        pop(){
            //there is nothing
            if(this.length === 0) return null
            //last state
            else if(this.length === 1){
                const prevHead = this.head;
                this.head= null
                this.tail = null
                this.length--;
                return prevHead.getState
            }
            //more than 1
            const prevTail = this.tail;
            this.tail = prevTail.prev;
            this.length--;
            return prevTail.getState;
        }
        getState(){
            return this.tail.getState;
        }
        getInitialState(){
            return this.head.getState
        }
        getPrevState(){
            return this.tail.prev.getState;
        }
        getLength(){
            return this.length;
        }
    }


    return{
        Observable,
        LinkedState
    }
})()


module.exports = stateMachine





