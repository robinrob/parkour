var BackgroundLayer = cc.Layer.extend({
    map00:null,
    map01:null,
    mapWidth:0,
    mapIndex:0,

    space:null,
    spriteSheet:null,
    objects:[],

    ctor:function (space) {
        cc.log("Background.cotr ...")
        this._super();

        // clean old array here
        this.objects = [];
        this.space = space;

        this.init();
    },

    init:function () {
        cc.log("BackgroundLayer.init ...")
        this._super();

        this.spriteBG1 = cc.Sprite.create(res.PlayBG_png)
        this.spriteBG1.setPosition(rss.p.addX(rss.p.subY(rss.center(), 200), 40));
        this.addChild(this.spriteBG1, -1);

        this.map00 = new cc.TMXTiledMap(res.map00_tmx);
        this.map00.setOpacity(0.5)
        this.addChild(this.map00);
        this.mapWidth = this.map00.getContentSize().width;
        this.map01 = new cc.TMXTiledMap(res.map01_tmx);
        this.map01.setPosition(cc.p(this.mapWidth, 0));
        this.map01.setOpacity(0.5)
        this.addChild(this.map01);

        // create sprite sheet
        cc.spriteFrameCache.addSpriteFrames(res.background_plist);
        this.spriteSheet = new cc.SpriteBatchNode(res.background_png);
        this.addChild(this.spriteSheet);

        this.loadObjects(this.map00, 0);
        this.loadObjects(this.map01, 1);

        this.scheduleUpdate();
    },

    checkAndReload:function (eyeX) {
        cc.log("BackgroundLayer.checkAndReload ...")
        var newMapIndex = parseInt(eyeX / this.mapWidth)
        this.spriteBG1.setPositionX(eyeX + this.mapWidth / 4);

        if (this.mapIndex == newMapIndex) {
            return false;
        }
        if (newMapIndex % 2 == 0) {
            // change mapSecond
            this.map01.setPositionX(this.mapWidth * (newMapIndex + 1));
            this.loadObjects(this.map01, newMapIndex + 2);
        } else {
            // change mapFirst
            this.map00.setPositionX(this.mapWidth * (newMapIndex + 1));
            this.loadObjects(this.map00, newMapIndex + 1);
        }
        this.removeObjects(newMapIndex - 1)
        this.mapIndex = newMapIndex;

        return true;
    },

    loadObjects:function (map, mapIndex) {
        cc.log("BackgroundLayer.loadObjects ...")
        // add coins
        var coinGroup = map.getObjectGroup("coin");
        var coinArray = coinGroup.getObjects();
        for (var i = 0; i < coinArray.length; i++) {
            var coin = new Coin(this.spriteSheet,
                this.space,
                cc.p(coinArray[i]["x"] + this.mapWidth * mapIndex,coinArray[i]["y"]));
            coin.mapIndex = mapIndex;
            this.objects.push(coin);
        }

        // add rock
        var rockGroup = map.getObjectGroup("rock");
        var rockArray = rockGroup.getObjects();
        for (var i = 0; i < rockArray.length; i++) {
            var rock = new Rock(this.spriteSheet,
                this.space,
                    rockArray[i]["x"] + this.mapWidth * mapIndex);
            rock.mapIndex = mapIndex;
            this.objects.push(rock);
        }
    },

    removeObjects:function (mapIndex) {
        cc.log("BackgroundLayer.removeObjects ...")
        while((function (obj, index) {
            for (var i = 0; i < obj.length; i++) {
                if (obj[i].mapIndex == index) {
                    obj[i].removeFromParent();
                    obj.splice(i, 1);
                    return true;
                }
            }
            return false;
        })(this.objects, mapIndex));
    },

    removeObjectByShape:function (shape) {
        cc.log("BackgroundLayer.removeObjectByShape ...")
        for (var i = 0; i < this.objects.length; i++) {
            if (this.objects[i].getShape() == shape) {
                this.objects[i].removeFromParent();
                this.objects.splice(i, 1);
                break;
            }
        }
    },

    update:function (dt) {
        cc.log("BackgroundLayer.update ...")
        var animationLayer = this.getParent().getChildByTag(TagOfLayer.Animation);
        var eyeX = animationLayer.getEyeX();
        this.checkAndReload(eyeX);

        //this.moveableBG.update(dt)
    }
});
