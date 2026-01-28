[h:arguments=if(argCount()>0,arg(0),"")]

[h:selected=json.get(json.fromList(getSelected()),0)]
[h:abort(json.contains(getProperty("class", selected), "Creature"))]

[h:mode=json.get(arguments,"mode")]
[if(mode=="positions"),code:{
    [h:firstPosition=json.get(arguments,"firstPosition")]
    [h:lastPosition=json.get(arguments,"lastPosition")]
    [h:tokenId1=currentToken()]

    [h:firstPositionX=json.get(firstPosition,"x")]
    [h:firstPositionY=json.get(firstPosition,"y")]
    [h:lastPositionX=json.get(lastPosition,"x")]
    [h:lastPositionY=json.get(lastPosition,"y")]
};{
    [h:tokenId1=json.get(arguments,"tokenId1")]
    [h:tokenId2=json.get(arguments,"tokenId2")]
    
    [h:firstPositionX=getTokenX(1,tokenId1)]
    [h:firstPositionY=getTokenY(1,tokenId1)]
    [h:lastPositionX=getTokenX(1,tokenId2)]
    [h:lastPositionY=getTokenY(1,tokenId2)]
}]

[h:dx = lastPositionX - firstPositionX]
[h:dy = lastPositionY - firstPositionY]

<!-- Simple ratio-based approach for 45° boundaries -->
<!-- For 45° diagonal boundaries, we use the ratio |dx|/|dy| -->
<!-- When |dx|/|dy| > tan(67.5°) ≈ 2.414, it's closer to horizontal -->
<!-- When |dx|/|dy| < tan(22.5°) ≈ 0.414, it's closer to vertical -->
<!-- Between those values, it's diagonal -->

[h,if(dx == 0 && dy == 0): direction = "right"] <!-- Default if same position -->

[if(dx >= 0 && dy <= 0), code: { <!-- Quadrant: right and up (right-up) -->
    [h:absDx = abs(dx)]
    [h:absDy = abs(dy)]
    [h,if(absDy == 0): direction = "right"]
    [h,if(absDx == 0): direction = "up"]
    [h,if(absDy > 0 && absDx > 0), code: {
        [h:ratio = absDx / absDy]
        [h,if(ratio > 2.414): direction = "right"]
        [h,if(ratio < 0.414): direction = "up"]
        [h,if(ratio >= 0.414 && ratio <= 2.414): direction = "right-up"]
    }]
}]

[if(dx <= 0 && dy <= 0), code: { <!-- Quadrant: left and up (left-up) -->
    [h:absDx = abs(dx)]
    [h:absDy = abs(dy)]
    [h,if(absDy == 0): direction = "left"]
    [h,if(absDx == 0): direction = "up"]
    [h,if(absDy > 0 && absDx > 0), code: {
        [h:ratio = absDx / absDy]
        [h,if(ratio > 2.414): direction = "left"]
        [h,if(ratio < 0.414): direction = "up"]
        [h,if(ratio >= 0.414 && ratio <= 2.414): direction = "left-up"]
    }]
}]

[if(dx <= 0 && dy >= 0), code: { <!-- Quadrant: left and down (left-down) -->
    [h:absDx = abs(dx)]
    [h:absDy = abs(dy)]
    [h,if(absDy == 0): direction = "left"]
    [h,if(absDx == 0): direction = "down"]
    [h,if(absDy > 0 && absDx > 0), code: {
        [h:ratio = absDx / absDy]
        [h,if(ratio > 2.414): direction = "left"]
        [h,if(ratio < 0.414): direction = "down"]
        [h,if(ratio >= 0.414 && ratio <= 2.414): direction = "left-down"]
    }]
}]

[if(dx >= 0 && dy >= 0), code: { <!-- Quadrant: right and down (right-down) -->
    [h:absDx = abs(dx)]
    [h:absDy = abs(dy)]
    [h,if(absDy == 0): direction = "right"]
    [h,if(absDx == 0): direction = "down"]
    [h,if(absDy > 0 && absDx > 0), code: {
        [h:ratio = absDx / absDy]
        [h,if(ratio > 2.414): direction = "right"]
        [h,if(ratio < 0.414): direction = "down"]
        [h,if(ratio >= 0.414 && ratio <= 2.414): direction = "right-down"]
    }]
}]

<!-- Fallback to original logic -->
[h,if(json.isEmpty(direction)), code: {
    [h,if(dx > 0): horizontal="right"]
    [h,if(dx < 0): horizontal="left"]
    [h,if(dx == 0): horizontal="none"]
    [h,if(dy > 0): vertical="down"]
    [h,if(dy < 0): vertical="up"]
    [h,if(dy == 0): vertical="none"]
    
    [h, if(horizontal == "none"): direction = vertical]
    [h, if(vertical == "none"): direction = horizontal]
    [h, if(horizontal != "none" && vertical != "none"): direction = horizontal + "-" + vertical]
}]

[h: c('instance("'+tokenId1+'").facing = "'+direction+'"')]